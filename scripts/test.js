const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function test() {
  try {
    const snapshot = await db.collection("registrations").get();
    console.log(`Successfully fetched ${snapshot.size} documents from registrations.`);
  } catch (err) {
    console.error("Failed to fetch registrations:", err);
  }
}

test();
