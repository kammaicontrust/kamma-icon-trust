import nodemailer from "nodemailer";
import { getAdminDb } from "@/app/lib/firebaseAdmin";

const OTP_EXPIRY_MS = 5 * 60 * 1000;

function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error(
      "Missing Gmail SMTP credentials. Set GMAIL_USER and GMAIL_PASS."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const transporter = createTransporter();
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    await db.collection("emailOtps").doc(normalizedEmail).set({
      otp,
      expiresAt,
      createdAt: Date.now(),
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: normalizedEmail,
      subject: "Your Email OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>Email Verification OTP</h2>
          <p>Your one-time password is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

    return Response.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return Response.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
