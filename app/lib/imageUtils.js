import imageCompression from "browser-image-compression";

// ── Allowed formats ──
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 10;

/**
 * Validate an image file before processing.
 * Returns { valid: true } or { valid: false, error: "..." }
 */
export function validateImageFile(file) {
  if (!file) return { valid: false, error: "No file selected" };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `Unsupported format: ${file.type.split("/")[1] || "unknown"}. Use JPG, PNG, or WebP.` };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return { valid: false, error: `Image too large (${sizeMB.toFixed(1)}MB). Max ${MAX_FILE_SIZE_MB}MB.` };
  }

  return { valid: true };
}

/**
 * Compress an image to max 1200px wide, ~1MB, WebP output.
 * Returns a compressed File object.
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp",
  };
  return await imageCompression(file, options);
}

/**
 * Generate a small thumbnail (200px wide) for fast gallery grid loading.
 * Returns a compressed File object suitable for separate upload.
 */
export async function generateThumbnail(file) {
  const options = {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 200,
    useWebWorker: true,
    fileType: "image/webp",
  };
  return await imageCompression(file, options);
}

/**
 * Generate a tiny blur placeholder as a data URL (stored in Firestore).
 * Uses canvas to create a ~20px wide blurred image.
 */
export function generateBlurPlaceholder(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const BLUR_SIZE = 20;
      const aspect = img.height / img.width;
      canvas.width = BLUR_SIZE;
      canvas.height = Math.round(BLUR_SIZE * aspect);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/webp", 0.1);
      URL.revokeObjectURL(img.src); // cleanup
      resolve(dataURL);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(null);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a unique hash for a file (name + size + lastModified) to prevent duplicates.
 */
export function getFileFingerprint(file) {
  return `${file.name}_${file.size}_${file.lastModified}`;
}

/**
 * Process files in batches of a given size.
 * processFn receives a single file and its index.
 * Returns array of results.
 */
export async function processInBatches(items, batchSize, processFn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, batchIdx) => processFn(item, i + batchIdx))
    );
    results.push(...batchResults);
  }
  return results;
}
