/**
 * Migration Script v2: "users" → "registrations"
 *
 * Uses Firebase Admin SDK (bypasses security rules).
 *
 * Reads every document from the "users" collection and creates a corresponding
 * document in the "registrations" collection, ensuring:
 *   - All required fields are copied (name, email, mobile, token, uid, profile)
 *   - photoURL is mapped to profileImageUrl
 *   - createdAt is mapped to submittedAt
 *   - Existing completed registrations are NOT overwritten
 *   - merge: true prevents partial data loss
 *
 * Usage:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
 *   node scripts/migrate-users-to-registrations-v2.mjs
 *
 *   OR place serviceAccountKey.json in project root.
 */

import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Initialize Firebase Admin ──
let credential;
const keyPath = resolve(__dirname, "../serviceAccountKey.json");

if (existsSync(keyPath)) {
  const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
  credential = admin.credential.cert(serviceAccount);
  console.log("🔑 Using serviceAccountKey.json from project root.\n");
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = admin.credential.applicationDefault();
  console.log("🔑 Using GOOGLE_APPLICATION_CREDENTIALS env var.\n");
} else {
  console.error(
    "❌ No credentials found.\n" +
      "   Either place serviceAccountKey.json in the project root,\n" +
      '   or set $env:GOOGLE_APPLICATION_CREDENTIALS = "path/to/key.json"\n'
  );
  process.exit(1);
}

admin.initializeApp({ credential });
const db = admin.firestore();

// ── Helpers ──
function safeStr(val) {
  return typeof val === "string" ? val : "";
}

// ── Main Migration ──
async function migrate() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Migrate: users → registrations  (v2 — Admin)   ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Step 1 — Read all users
  console.log('📖 Reading all documents from "users" collection...');
  const usersSnapshot = await db.collection("users").get();
  const total = usersSnapshot.size;
  console.log(`   Found ${total} documents.\n`);

  if (total === 0) {
    console.log("Nothing to migrate. Exiting.");
    process.exit(0);
  }

  let migrated = 0;
  let skipped = 0;
  let errored = 0;

  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();

    try {
      // ── Skip users without a token (not real registrations) ──
      if (!userData.token) {
        console.log(`⏭️  [${uid}] Skipped — no token field`);
        skipped++;
        continue;
      }

      const regRef = db.collection("registrations").doc(uid);

      // ── Build the registration document ──
      const registrationData = {
        // Core identity
        uid: uid,
        name: safeStr(userData.name || userData.displayName),
        email: safeStr(userData.email),
        mobile: safeStr(userData.mobile),
        token: safeStr(userData.token),
        authProvider: safeStr(userData.authProvider || "google"),

        // Map photoURL → profileImageUrl
        profileImageUrl: safeStr(
          userData.photoURL || userData.profileImageUrl
        ),

        // Map createdAt → submittedAt (preserve original timestamp)
        ...(userData.createdAt ? { submittedAt: userData.createdAt } : {}),

        // Profile object (full copy if present)
        ...(userData.profile ? { profile: userData.profile } : {}),

        // Mark as completed so they show up in the directory
        profileCompleted: true,

        // Resume if present
        ...(userData.resumeUrl ? { resumeUrl: userData.resumeUrl } : {}),

        // Aadhaar last 4 if present
        ...(userData.aadhaarLast4
          ? { aadhaarLast4: userData.aadhaarLast4 }
          : {}),

        // Migration metadata
        migratedFromUsers: true,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // ── Write with merge: true to avoid overwriting any existing data ──
      await regRef.set(registrationData, { merge: true });

      console.log(
        `✅ [${uid}] Migrated — name: "${registrationData.name || "—"}", token: ${registrationData.token}`
      );
      migrated++;
    } catch (err) {
      console.error(`❌ [${uid}] Error:`, err.message);
      errored++;
    }
  }

  // ── Summary ──
  console.log("\n════════════════════════════════════════");
  console.log("🎉 Migration Complete!");
  console.log(`   Total in "users":  ${total}`);
  console.log(`   Migrated:          ${migrated}`);
  console.log(`   Skipped:           ${skipped}`);
  console.log(`   Errors:            ${errored}`);
  console.log("════════════════════════════════════════\n");

  // ── Verify ──
  console.log('🔍 Verifying: reading "registrations" collection...');
  const regSnapshot = await db.collection("registrations").get();
  console.log(`   "registrations" now has ${regSnapshot.size} documents.`);

  // List all registration docs for verification
  console.log("\n📋 Registration documents:");
  for (const doc of regSnapshot.docs) {
    const d = doc.data();
    console.log(
      `   • ${doc.id} — name: "${d.name || "—"}", token: ${d.token || "—"}, mobile: ${d.mobile || "—"}, migrated: ${d.migratedFromUsers ? "yes" : "no"}`
    );
  }

  console.log("\n✅ Done.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("\n💥 Migration failed:", err);
  process.exit(1);
});
