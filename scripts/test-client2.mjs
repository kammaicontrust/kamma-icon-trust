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
    
    const profilesData = snapshot.docs.map(doc => {
      const rootData = doc.data();
      const data = rootData.profile || {};
      
      let calculatedAge = null;
      if (data.dateOfBirth) {
        const dob = new Date(data.dateOfBirth);
        const diffMs = Date.now() - dob.getTime();
        const ageDt = new Date(diffMs);
        calculatedAge = Math.abs(ageDt.getUTCFullYear() - 1970);
      }
      
      return { 
        id: doc.id, 
        ...data,
        name: rootData.name || data.name,
        village: data.placeOfBirth || data.village,
        gothram: data.gotra || data.gothram,
        age: calculatedAge || data.age,
        photoUrl: rootData.profileImageUrl
      };
    });
    
    console.log("Mapped successfully:", profilesData.length);
  } catch (err) {
    console.error("Mapping Error:", err);
  }
}

test();
