/**
 * Token Seed Script for Kamma Icon Trust
 * 
 * Creates tokens in the Firestore `tokens` collection.
 * Each token is bound to exactly one mobile number.
 * 
 * Usage:
 *   node scripts/seedTokens.js
 * 
 * Prerequisites:
 *   1. Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account key path
 *      OR place a serviceAccountKey.json in the project root
 *   2. npm install firebase-admin (if not already installed)
 * 
 * Schema per token document:
 *   tokens/{autoId}:
 *     token: string          — Unique token code (e.g. "KIT-0001")
 *     mobile: string         — 10-digit mobile number bound to this token
 *     used: boolean          — Whether the token has been redeemed
 *     usedBy: string|null    — Firebase UID of the user who redeemed it
 *     usedByEmail: string|null
 *     usedAt: Timestamp|null
 *     createdAt: Timestamp
 * 
 * Constraints enforced:
 *   - Each mobile number appears in at most ONE token document
 *   - Each token string is globally unique
 *   - Duplicate mobiles/tokens in the input array will be rejected before writing
 */

const admin = require("firebase-admin");
const path = require("path");

// ─── Initialize Firebase Admin ───
// Try service account key from project root, fallback to env var
let serviceAccount;
try {
  serviceAccount = require(path.resolve(__dirname, "../serviceAccountKey.json"));
} catch {
  console.log("No serviceAccountKey.json found. Using GOOGLE_APPLICATION_CREDENTIALS env var.");
}

if (!admin.apps.length) {
  admin.initializeApp(
    serviceAccount
      ? { credential: admin.credential.cert(serviceAccount) }
      : { credential: admin.credential.applicationDefault() }
  );
}

const db = admin.firestore();

// ─── Token Data to Seed ───
// EDIT THIS ARRAY to add your tokens and mobile numbers
const tokensToSeed = [
  { token: "KIT-0001", mobile: "9876543210" },
  { token: "KIT-0002", mobile: "9876543211" },
  { token: "KIT-0003", mobile: "9876543212" },
  { token: "KIT-0004", mobile: "9876543213" },
  { token: "KIT-0005", mobile: "9876543214" },
  // Add more tokens here...
];

// ─── Validation ───
function validateInput(tokens) {
  const errors = [];
  const seenTokens = new Set();
  const seenMobiles = new Set();

  for (const entry of tokens) {
    // Token must be non-empty string
    if (!entry.token || typeof entry.token !== "string" || !entry.token.trim()) {
      errors.push(`Invalid token value: "${entry.token}"`);
      continue;
    }

    // Mobile must be exactly 10 digits
    if (!entry.mobile || !/^\d{10}$/.test(entry.mobile)) {
      errors.push(`Invalid mobile "${entry.mobile}" for token "${entry.token}". Must be 10 digits.`);
      continue;
    }

    // Check for duplicate tokens in input
    const normalizedToken = entry.token.trim().toUpperCase();
    if (seenTokens.has(normalizedToken)) {
      errors.push(`Duplicate token in input: "${normalizedToken}"`);
      continue;
    }
    seenTokens.add(normalizedToken);

    // Check for duplicate mobiles in input
    if (seenMobiles.has(entry.mobile)) {
      errors.push(`Duplicate mobile in input: "${entry.mobile}" (token: "${entry.token}"). One mobile = one token.`);
      continue;
    }
    seenMobiles.add(entry.mobile);
  }

  return errors;
}

// ─── Check against existing Firestore data ───
async function checkExistingConflicts(tokens) {
  const errors = [];
  const existingSnapshot = await db.collection("registrations").get();
  
  const existingTokens = new Set();
  const existingMobiles = new Set();

  existingSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.token) existingTokens.add(data.token.toUpperCase());
    if (data.mobile) existingMobiles.add(data.mobile);
  });

  for (const entry of tokens) {
    const normalizedToken = entry.token.trim().toUpperCase();
    
    if (existingTokens.has(normalizedToken)) {
      errors.push(`Token "${normalizedToken}" already exists in Firestore.`);
    }

    if (existingMobiles.has(entry.mobile)) {
      errors.push(`Mobile "${entry.mobile}" is already bound to an existing token in Firestore.`);
    }
  }

  return errors;
}

// ─── Seed Tokens ───
async function seedTokens() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   Kamma Icon Trust — Token Seeder    ║");
  console.log("╚══════════════════════════════════════╝\n");

  // Step 1: Validate input
  console.log(`Validating ${tokensToSeed.length} tokens...`);
  const inputErrors = validateInput(tokensToSeed);
  if (inputErrors.length > 0) {
    console.error("\n❌ Input validation failed:");
    inputErrors.forEach((e) => console.error(`   • ${e}`));
    process.exit(1);
  }
  console.log("✅ Input validation passed.\n");

  // Step 2: Check against existing Firestore data
  console.log("Checking for conflicts with existing Firestore tokens...");
  const conflictErrors = await checkExistingConflicts(tokensToSeed);
  if (conflictErrors.length > 0) {
    console.error("\n❌ Conflicts found with existing data:");
    conflictErrors.forEach((e) => console.error(`   • ${e}`));
    process.exit(1);
  }
  console.log("✅ No conflicts found.\n");

  // Step 3: Write tokens using a batch
  console.log("Writing tokens to Firestore...");
  const batch = db.batch();

  for (const entry of tokensToSeed) {
    const ref = db.collection("registrations").doc();
    batch.set(ref, {
      name: "Admin Seeded",
      token: entry.token.trim().toUpperCase(),
      mobile: entry.mobile,
      profileCompleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  console.log(`\n✅ Successfully seeded ${tokensToSeed.length} tokens!\n`);
  console.log("Tokens created:");
  tokensToSeed.forEach((t) => {
    console.log(`   ${t.token.toUpperCase()}  →  ${t.mobile}`);
  });
  console.log("\nDone.");
  process.exit(0);
}

seedTokens().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
