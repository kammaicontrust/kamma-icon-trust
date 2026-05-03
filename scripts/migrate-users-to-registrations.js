/**
 * Migration Script: Copy profiles from "users" → "registrations"
 *
 * Run this ONCE to migrate any profiles that were saved in the old "users"
 * collection into the "registrations" collection (single source of truth).
 *
 * Usage:
 *   1. Open your deployed site in a browser
 *   2. Open DevTools Console (F12 → Console)
 *   3. Paste this entire script and press Enter
 *   4. It will log progress for each migrated document
 *
 * Safety:
 *   - Uses { merge: true } so it will NOT overwrite existing registrations
 *   - Only copies users that have a "token" field (i.e. registered users)
 *   - Skips users that already exist in "registrations"
 */

(async function migrateUsersToRegistrations() {
  // Import Firebase from the existing app
  const { db } = await import("/app/lib/firebase.js");
  const {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    serverTimestamp,
  } = await import("firebase/firestore");

  console.log("🔄 Starting migration: users → registrations...\n");

  const usersSnapshot = await getDocs(collection(db, "users"));
  let migrated = 0;
  let skipped = 0;
  let total = usersSnapshot.size;

  console.log(`Found ${total} documents in "users" collection.\n`);

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;

    // Only migrate users that have a token (actual registered users)
    if (!userData.token) {
      console.log(`⏭️  Skipping ${uid} — no token field`);
      skipped++;
      continue;
    }

    // Check if already exists in registrations
    const regRef = doc(db, "registrations", uid);
    const regSnap = await getDoc(regRef);

    if (regSnap.exists() && regSnap.data().profileCompleted) {
      console.log(`⏭️  Skipping ${uid} — already has completed registration`);
      skipped++;
      continue;
    }

    // Build the registration document from user data
    const registrationData = {
      uid: uid,
      email: userData.email || "",
      name: userData.name || userData.displayName || "",
      mobile: userData.mobile || "",
      token: userData.token || "",
      authProvider: userData.authProvider || "google",
      migratedFromUsers: true,
      migratedAt: serverTimestamp(),
    };

    // If user has profile data, include it
    if (userData.profile) {
      registrationData.profile = userData.profile;
      registrationData.profileCompleted = true;
    }
    if (userData.profileImageUrl) {
      registrationData.profileImageUrl = userData.profileImageUrl;
    }
    if (userData.resumeUrl) {
      registrationData.resumeUrl = userData.resumeUrl;
    }
    if (userData.submittedAt) {
      registrationData.submittedAt = userData.submittedAt;
    }

    await setDoc(regRef, registrationData, { merge: true });
    console.log(`✅ Migrated ${uid} (${userData.name || "unnamed"})`);
    migrated++;
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Total:    ${total}`);
})();
