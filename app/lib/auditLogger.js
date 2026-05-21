import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const logAdminAction = async (adminEmail, action, targetId, targetName, additionalDetails = {}) => {
  try {
    await addDoc(collection(db, "auditLogs"), {
      adminEmail: adminEmail || "system-operator",
      action, // 'approve', 'reject', 'delete', 'soft_delete', etc.
      targetId,
      targetName: targetName || "Unnamed Profile",
      timestamp: serverTimestamp(),
      ...additionalDetails
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
