import { getAdminDb } from "@/app/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedOtp = otp?.trim();

    if (!normalizedEmail || !normalizedOtp) {
      return Response.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const otpDoc = await db.collection("emailOtps").doc(normalizedEmail).get();

    if (!otpDoc.exists) {
      return Response.json({ error: "OTP not found" }, { status: 400 });
    }

    const data = otpDoc.data();

    if (Date.now() > data.expiresAt) {
      await db.collection("emailOtps").doc(normalizedEmail).delete();
      return Response.json(
        { error: "OTP expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (data.otp !== normalizedOtp) {
      return Response.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await db.collection("emailOtps").doc(normalizedEmail).delete();

    return Response.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return Response.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
