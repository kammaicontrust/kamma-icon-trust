import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";

// 🔥 paste your firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyD8DgHDZAk38eZzX3iFd8hUIxSR7pBXX4M",
  authDomain: "kamma-icon-trust-fb927.firebaseapp.com",
  projectId: "kamma-icon-trust-fb927",
  storageBucket: "kamma-icon-trust-fb927.firebasestorage.app",
  messagingSenderId: "795643143316",
  appId: "1:795643143316:web:274f25a4f3951516aa0081"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tokens = JSON.parse(fs.readFileSync("tokens.json", "utf-8"));

async function uploadTokens() {
  for (let token of tokens) {
    await addDoc(collection(db, "tokens"), {
      tokenNumber: token,
      used: false,
      createdAt: new Date()
    });
    console.log("Uploaded:", token);
  }
  console.log("All tokens uploaded ✅");
}

uploadTokens();