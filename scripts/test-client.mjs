import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8DgHDZAk38eZzX3iFd8hUIxSR7pBXX4M",
  authDomain: "kamma-icon-trust-fb927.firebaseapp.com",
  projectId: "kamma-icon-trust-fb927",
  storageBucket: "kamma-icon-trust-fb927.appspot.com",
  messagingSenderId: "795643143316",
  appId: "1:795643143316:web:274f25a4f3951516aa0081"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const snapshot = await getDocs(collection(db, "registrations"));
    console.log(`Success! Found ${snapshot.size} docs.`);
  } catch (err) {
    console.error("Firebase Error:", err);
  }
}

test();
