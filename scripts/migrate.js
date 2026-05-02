const admin = require("firebase-admin");

// NOTE: To run this script, you must have your Firebase Admin Service Account JSON key.
// Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of your JSON key file.
// Example: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
// Then run: node scripts/migrate.js

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function migrateData() {
  console.log("Starting migration to 'registrations' collection...");

  const profilesSnap = await db.collection("profiles").get();
  console.log(`Found ${profilesSnap.size} profiles to migrate.`);

  let count = 0;
  for (const doc of profilesSnap.docs) {
    const profileData = doc.data();
    const uid = profileData.uid || doc.id;

    const regRef = db.collection("registrations").doc(uid);
    const regSnap = await regRef.get();

    let existingProfile = {};
    let existingRegData = {};

    if (regSnap.exists) {
      existingRegData = regSnap.data();
      existingProfile = existingRegData.profile || {};
    }

    // Safely merge profile data
    const mergedProfile = { ...profileData, ...existingProfile };

    await regRef.set(
      {
        uid: uid,
        token: profileData.token || existingRegData.token || "",
        mobile: profileData.mobile || existingRegData.mobile || "",
        name: profileData.name || existingRegData.name || "",
        profileImageUrl: profileData.profileImageUrl || existingRegData.profileImageUrl || "",
        resumeUrl: profileData.resumeUrl || existingRegData.resumeUrl || "",
        profile: mergedProfile,
      },
      { merge: true }
    );

    console.log(`Migrated UID: ${uid}`);
    count++;
  }

  // Also check the users collection just in case some users have missing profiles
  const usersSnap = await db.collection("users").get();
  console.log(`\nChecking ${usersSnap.size} users for any missing migration...`);
  
  for (const doc of usersSnap.docs) {
    const userData = doc.data();
    const uid = doc.id;

    // Skip if we already migrated from profiles
    const regRef = db.collection("registrations").doc(uid);
    const regSnap = await regRef.get();

    if (!regSnap.exists) {
      // Create empty registration with user data
      await regRef.set(
        {
          uid: uid,
          token: userData.token || "",
          mobile: userData.mobile || "",
          name: userData.name || "",
          profileImageUrl: userData.profileImageUrl || "",
          resumeUrl: userData.resumeUrl || "",
          profile: {
             name: userData.name,
             mobile: userData.mobile,
             emailId: userData.email,
             ...userData
          },
        },
        { merge: true }
      );
      console.log(`Migrated standalone user UID: ${uid}`);
      count++;
    }
  }

  console.log(`\nMigration complete! Successfully processed ${count} records.`);
}

migrateData().catch((err) => {
  console.error("Migration failed:", err);
});
