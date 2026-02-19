// "use server";

// import { db } from "../firebase";
// import { doc, updateDoc, getDoc } from "firebase/firestore";
// import { generateReceipt } from "./generateReceipt";
// import { sendReceiptEmail } from "./sendReceiptEmail";

// export async function verifyDonation(donationId) {
//   const ref = doc(db, "donations", donationId);
//   const snap = await getDoc(ref);

//   if (!snap.exists()) {
//     throw new Error("Donation not found");
//   }

//   const donation = snap.data();

//   await updateDoc(ref, {
//     verified: true,
//     verifiedAt: new Date(),
//   });

//   const receipt = await generateReceipt({
//     id: donationId,
//     ...donation,
//   });

//   await sendReceiptEmail({
//     ...receipt,
//     email: donation.email,
//     name: donation.name,
//   });

//   return {
//     success: true,
//     receiptUrl: receipt.receiptUrl,
//   };
// }
