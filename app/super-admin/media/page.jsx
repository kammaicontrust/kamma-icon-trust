"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { db, storage } from "@/app/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  serverTimestamp, orderBy, query, onSnapshot
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import {
  compressImage, generateThumbnail, generateBlurPlaceholder,
  validateImageFile, getFileFingerprint, processInBatches
} from "@/app/lib/imageUtils";
import {
  ImageIcon, Video, Trash2, Loader2, Upload, Tag,
  Maximize2, Zap, X, RotateCcw, CheckCircle, AlertCircle, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Upload status enum ──
const STATUS = { PENDING: "pending", COMPRESSING: "compressing", UPLOADING: "uploading", DONE: "done", ERROR: "error" };
const BATCH_SIZE = 2;

export default function MediaManager() {
  const [activeTab, setActiveTab] = useState("Gallery");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  // ── Multi-upload state ──
  const [selectedFiles, setSelectedFiles] = useState([]); // [{file, preview, status, progress, error, id}]
  const [isUploading, setIsUploading] = useState(false);
  const uploadedFingerprints = useRef(new Set());

  // ── Metadata fields ──
  const [category, setCategory] = useState("Event");

  // ── Caption editing ──
  const [editingId, setEditingId] = useState(null);
  const [editCaption, setEditCaption] = useState("");

  // ── Fetch media with ordering: order ASC → fallback createdAt DESC ──
  useEffect(() => {
    setMounted(true);
    const coll = activeTab === "Gallery" ? "gallery" : "videos";
    const q = query(collection(db, coll), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Fallback: items without `order` go to the end, sorted by createdAt desc
      docs.sort((a, b) => {
        if (a.order != null && b.order != null) return a.order - b.order;
        if (a.order != null) return -1;
        if (b.order != null) return 1;
        // Both lack order → createdAt desc
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setMedia(docs);
      setLoading(false);
    }, (err) => {
      // If index doesn't exist yet for `order`, fallback to createdAt
      console.warn("Order index not ready, falling back:", err);
      const fallbackQ = query(collection(db, coll), orderBy("createdAt", "desc"));
      onSnapshot(fallbackQ, (snapshot) => {
        setMedia(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, [activeTab]);

  // ── Cleanup preview URLs on unmount ──
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, [selectedFiles]);

  // ── File selection handler ──
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newFiles = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      const fingerprint = getFileFingerprint(file);

      // Prevent duplicates
      if (uploadedFingerprints.current.has(fingerprint)) continue;
      // Check if already selected
      if (selectedFiles.some(sf => getFileFingerprint(sf.file) === fingerprint)) continue;

      uploadedFingerprints.current.add(fingerprint);
      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        status: validation.valid ? STATUS.PENDING : STATUS.ERROR,
        progress: 0,
        error: validation.valid ? null : validation.error,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        retryCount: 0,
      });
    }
    setSelectedFiles(prev => [...prev, ...newFiles]);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Remove a file from selection ──
  const removeFile = (id) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      const fp = file ? getFileFingerprint(file.file) : null;
      if (fp) uploadedFingerprints.current.delete(fp);
      return prev.filter(f => f.id !== id);
    });
  };

  // ── Upload a single file with resumable upload + auto retry ──
  const uploadSingleFile = (fileItem) => {
    return new Promise((resolve) => {
      const doUpload = async (retryAttempt) => {
        // Update status: compressing
        setSelectedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: STATUS.COMPRESSING, progress: 0 } : f));

        try {
          // 1. Compress
          const compressed = await compressImage(fileItem.file);

          // 2. Generate thumbnail
          const thumbnail = await generateThumbnail(fileItem.file);

          // 3. Generate blur placeholder
          const blurDataURL = await generateBlurPlaceholder(fileItem.file);

          // 4. Upload main image
          setSelectedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: STATUS.UPLOADING } : f));

          const mainPath = `gallery/${Date.now()}_${fileItem.file.name.replace(/\.[^.]+$/, "")}.webp`;
          const mainRef = ref(storage, mainPath);
          const mainTask = uploadBytesResumable(mainRef, compressed);

          mainTask.on("state_changed", (snap) => {
            const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 80);
            setSelectedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress } : f));
          });

          await mainTask;
          const mainUrl = await getDownloadURL(mainRef);

          // 5. Upload thumbnail
          setSelectedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: 85 } : f));

          const thumbPath = `gallery/thumbs/${Date.now()}_thumb.webp`;
          const thumbRef = ref(storage, thumbPath);
          await uploadBytesResumable(thumbRef, thumbnail);
          const thumbnailUrl = await getDownloadURL(thumbRef);

          // 6. Save to Firestore
          setSelectedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: 95 } : f));

          const coll = activeTab === "Gallery" ? "gallery" : "videos";
          const nextOrder = media.length;
          await addDoc(collection(db, coll), {
            imageUrl: mainUrl,
            thumbnailUrl,
            blurDataURL: blurDataURL || null,
            storagePath: mainPath,
            thumbStoragePath: thumbPath,
            title: fileItem.file.name.replace(/\.[^.]+$/, ""),
            category,
            order: nextOrder,
            createdAt: serverTimestamp(),
          });

          setSelectedFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: STATUS.DONE, progress: 100 } : f));
          resolve(true);

        } catch (error) {
          console.error("Upload error:", error);
          if (retryAttempt === 0) {
            // Auto retry once
            console.log("Auto-retrying upload...");
            setTimeout(() => doUpload(1), 1000);
          } else {
            setSelectedFiles(prev => prev.map(f => f.id === fileItem.id
              ? { ...f, status: STATUS.ERROR, error: "Upload failed. Tap retry.", retryCount: retryAttempt }
              : f
            ));
            resolve(false);
          }
        }
      };

      doUpload(0);
    });
  };

  // ── Upload all selected files in batches ──
  const handleUploadAll = async () => {
    const pending = selectedFiles.filter(f => f.status === STATUS.PENDING || f.status === STATUS.ERROR);
    if (!pending.length) return;
    setIsUploading(true);

    await processInBatches(pending, BATCH_SIZE, async (fileItem) => {
      return uploadSingleFile(fileItem);
    });

    setIsUploading(false);
  };

  // ── Retry a single failed upload ──
  const retryUpload = async (id) => {
    const fileItem = selectedFiles.find(f => f.id === id);
    if (!fileItem) return;
    setSelectedFiles(prev => prev.map(f => f.id === id ? { ...f, status: STATUS.PENDING, error: null } : f));
    await uploadSingleFile(fileItem);
  };

  // ── Clear completed uploads ──
  const clearCompleted = () => {
    setSelectedFiles(prev => {
      prev.filter(f => f.status === STATUS.DONE).forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
        uploadedFingerprints.current.delete(getFileFingerprint(f.file));
      });
      return prev.filter(f => f.status !== STATUS.DONE);
    });
  };

  // ── Delete media ──
  const handleDelete = async (item) => {
    if (!confirm("Delete this media permanently?")) return;
    try {
      if (item.storagePath) await deleteObject(ref(storage, item.storagePath)).catch(() => {});
      if (item.thumbStoragePath) await deleteObject(ref(storage, item.thumbStoragePath)).catch(() => {});
      const coll = activeTab === "Gallery" ? "gallery" : "videos";
      await deleteDoc(doc(db, coll, item.id));
    } catch (error) {
      alert("Delete failed.");
    }
  };

  // ── Save caption ──
  const saveCaption = async (id) => {
    const coll = activeTab === "Gallery" ? "gallery" : "videos";
    await updateDoc(doc(db, coll, id), { title: editCaption });
    setEditingId(null);
  };

  // ── Status badge renderer ──
  const StatusBadge = ({ file: f }) => {
    if (f.status === STATUS.DONE) return <div className="absolute top-3 right-3 p-2 bg-emerald-500 rounded-xl text-white"><CheckCircle className="w-4 h-4" /></div>;
    if (f.status === STATUS.ERROR) return <div className="absolute top-3 right-3 p-2 bg-rose-500 rounded-xl text-white"><AlertCircle className="w-4 h-4" /></div>;
    if (f.status === STATUS.COMPRESSING || f.status === STATUS.UPLOADING) return (
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-2 z-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
        <span className="text-[9px] font-black text-white uppercase tracking-widest">
          {f.status === STATUS.COMPRESSING ? "Optimizing..." : `${f.progress}%`}
        </span>
        <div className="w-3/4 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#FFD700] rounded-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
        </div>
      </div>
    );
    return null;
  };

  // ── Shimmer skeleton ──
  const Skeleton = () => (
    <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-gray-100 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.5s_infinite]" />
      <style jsx>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );

  const pendingCount = selectedFiles.filter(f => f.status === STATUS.PENDING).length;
  const doneCount = selectedFiles.filter(f => f.status === STATUS.DONE).length;
  const errorCount = selectedFiles.filter(f => f.status === STATUS.ERROR).length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0A1F44] tracking-tight">Media Control</h1>
          <p className="text-gray-500 font-medium mt-1">Upload, optimize, and manage gallery assets.</p>
        </div>
        <div className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
          {["Gallery", "Videos"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-[#0A1F44] text-white shadow-xl shadow-[#0A1F44]/20"
                  : "text-[#0A1F44]/30 hover:text-[#0A1F44]"
              }`}
            >
              {tab === "Gallery" ? <ImageIcon className="w-4 h-4 inline mr-2" /> : <Video className="w-4 h-4 inline mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drop zone */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Select Images</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-[#FFD700]/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-black text-[#0A1F44]/40 uppercase tracking-widest">Select multiple files</p>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">JPG, PNG, WebP • Max 10MB</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Options + status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl p-5 outline-none focus:bg-white focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-black text-xs uppercase tracking-widest text-[#0A1F44]"
                >
                  <option value="Event">Event</option>
                  <option value="Community">Community</option>
                  <option value="Charity">Charity</option>
                  <option value="Award">Award</option>
                </select>
              </div>
              <div className="bg-[#0A1F44] rounded-[2rem] p-6 text-white flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-10 h-10" /></div>
                <h4 className="text-sm font-black tracking-tight mb-1">Auto-Optimization</h4>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                  WebP conversion • Thumbnail generation • Blur placeholders
                </p>
              </div>
            </div>

            {/* Upload action bar */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-between bg-gray-50 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#0A1F44]/50">
                  <span>{selectedFiles.length} selected</span>
                  {doneCount > 0 && <span className="text-emerald-600">{doneCount} done</span>}
                  {errorCount > 0 && <span className="text-rose-500">{errorCount} failed</span>}
                </div>
                <div className="flex items-center gap-3">
                  {doneCount > 0 && (
                    <button onClick={clearCompleted} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0A1F44] transition-colors">
                      Clear Done
                    </button>
                  )}
                  <button
                    onClick={handleUploadAll}
                    disabled={isUploading || pendingCount === 0}
                    className="bg-[#0A1F44] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#0A1F44]/20 hover:scale-[1.02] transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-[#FFD700]" />}
                    {isUploading ? "Uploading..." : `Upload ${pendingCount}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview grid */}
        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedFiles.map(f => (
              <div key={f.id} className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-100 group">
                <img src={f.preview} className="w-full h-full object-cover" alt="" />
                <StatusBadge file={f} />
                {/* Remove button (only when pending) */}
                {f.status === STATUS.PENDING && (
                  <button onClick={() => removeFile(f.id)} className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Retry button */}
                {f.status === STATUS.ERROR && (
                  <button onClick={() => retryUpload(f.id)} className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-rose-600 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Retry
                  </button>
                )}
                {/* Error message */}
                {f.status === STATUS.ERROR && f.error && (
                  <div className="absolute bottom-10 left-2 right-2 text-center text-[8px] font-bold text-rose-300 bg-black/60 rounded-lg px-2 py-1">
                    {f.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {loading || !mounted ? (
            <>
              {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} />)}
            </>
          ) : media.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id}
              className="group relative aspect-square rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-sm border border-gray-100"
            >
              <img
                src={item.thumbnailUrl || item.imageUrl}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={item.title || ""}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm font-bold outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveCaption(item.id)}
                      />
                      <button onClick={() => saveCaption(item.id)} className="p-2 bg-emerald-500 rounded-xl text-white"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-white/10 rounded-xl text-white"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <p className="text-white font-black text-sm tracking-tight mb-1">{item.title}</p>
                  )}
                  <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-3 h-3 text-[#FFD700]" />
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setEditingId(item.id); setEditCaption(item.title || ""); }}
                      className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white hover:text-[#0A1F44] transition-all"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-3 bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white hover:text-[#0A1F44] transition-all">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
