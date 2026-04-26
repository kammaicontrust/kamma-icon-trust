# Firestore Schema — Kamma Icon Trust

## Collections Overview

```
firestore/
├── users/{uid}              — Auth + profile summary (public read)
├── profiles/{uid}           — Public matrimonial profile (public read)
├── registrations/{uid}      — Full private registration data (owner only)
├── tokens/{autoId}          — Token records (auth read, one-time update)
├── gallery/{autoId}         — Gallery images (public read)
└── videos/{autoId}          — Video links (public read)
```

---

## `users/{uid}`

Created on Google sign-in. Updated on registration submit.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `email` | string | Google account email |
| `displayName` | string | Google display name |
| `photoURL` | string | Google profile photo |
| `authProvider` | string | Always `"google"` |
| `lastLoginAt` | Timestamp | Last sign-in time |
| `name` | string | Full name from registration form |
| `mobile` | string | 10-digit contact number from form |
| `token` | string | Verified token code (e.g. `"KIT-0001"`) |
| `registrationEmail` | string | Email from registration form |
| `registrationCompleted` | boolean | `true` after successful submit |
| `registrationUpdatedAt` | Timestamp | When registration was last submitted |
| `tokenId` | string | Firestore doc ID of the used token |
| `profileImageUrl` | string | Storage URL of profile image |
| `resumeUrl` | string | Storage URL of resume PDF |

**Security:** Public read, owner write only (`auth.uid == userId`).

**Queried by:**
- `/profiles` page — lists all users
- `/profile/[id]` page — single user detail
- `/my-profile-login` page — `where("token", "==", x) && where("mobile", "==", y)`

---

## `profiles/{uid}`

Created on registration submit. Contains public-facing matrimonial data.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `name` | string | Full name |
| `gender` | string | Male / Female / Other |
| `dateOfBirth` | string | Date of birth |
| `placeOfBirth` | string | Birth town/city/village |
| `maritalStatus` | string | Never Married / Divorced / Widowed |
| `caste` | string | Caste |
| `gotra` | string | Gotra (same as gothram) |
| `rashi` | string | Rashi |
| `nakshatra` | string | Nakshatra |
| `education` | string | Highest qualification |
| `occupation` | string | Current occupation |
| `height` | string | Height (e.g. "5 ft 8 in") |
| `weight` | string | Weight (e.g. "62 kg") |
| `complexion` | string | Complexion |
| `bloodGroup` | string | Blood group |
| `village` | string | Mapped from `placeOfBirth` |
| `gothram` | string | Mapped from `gotra` |
| `mobile` | string | 10-digit contact number |
| `email` | string | Email from form |
| `token` | string | Token code used |
| `tokenId` | string | Firestore doc ID of the used token |
| `profileImageUrl` | string | Storage URL of profile image |
| `photoUrl` | string | Alias for profileImageUrl (compat) |
| `resumeUrl` | string | Storage URL of resume PDF |
| `profileCompleted` | boolean | Always `true` |
| `createdAt` | Timestamp | When profile was first created |
| `updatedAt` | Timestamp | When profile was last updated |

**Security:** Public read, owner write only (`auth.uid == userId`).

---

## `registrations/{uid}`

Full private registration data. Contains all 25+ form fields.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `email` | string | Google account email |
| `registrationEmail` | string | Email from form |
| `authProvider` | string | `"google"` |
| `tokenId` | string | Firestore doc ID |
| `tokenValue` | string | Token code used |
| `profileCompleted` | boolean | `true` |
| `submittedAt` | Timestamp | First submission time |
| `updatedAt` | Timestamp | Last update time |
| `profileImageUrl` | string | Storage URL |
| `resumeUrl` | string | Storage URL |
| `profile` | map | All 25 form fields as a nested object |

**Security:** Private — only the owning user can read/write.

---

## `tokens/{autoId}`

Pre-seeded by admin via `scripts/seedTokens.js`.

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | Unique token code (e.g. `"KIT-0001"`) |
| `tokenNumber` | string | Same as `token` (compat field) |
| `mobile` | string | 10-digit mobile bound to this token |
| `used` | boolean | `false` initially, `true` after redemption |
| `usedBy` | string\|null | UID of user who redeemed |
| `usedByEmail` | string\|null | Email of user who redeemed |
| `usedAt` | Timestamp\|null | When token was redeemed |
| `createdAt` | Timestamp | When token was seeded |

**Constraints:**
- One mobile → one token (enforced by seed script)
- Each token string is globally unique
- Tokens can only be updated once (`used: false → true`)

**Security:** Authenticated read, one-time update only, no create/delete from client.

---

## `gallery/{autoId}`

| Field | Type | Description |
|-------|------|-------------|
| `imageUrl` | string | Cloudinary/Storage URL |
| `storagePath` | string | Firebase Storage path |
| `createdAt` | Timestamp | Upload time |

**Security:** Public read, authenticated write.

---

## `videos/{autoId}`

| Field | Type | Description |
|-------|------|-------------|
| `videoUrl` | string | Video URL |
| `videoId` | string | YouTube video ID |
| `title` | string | Video title |
| `createdAt` | Timestamp | Upload time |

**Security:** Public read, authenticated write.
