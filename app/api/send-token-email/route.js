import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, name, token, mobile } = await request.json();

    // Validate inputs
    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required." },
        { status: 400 }
      );
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: `"Kamma Icon Trust" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Kamma Icon Trust Token",
      text: [
        `Dear ${name || "User"},`,
        "",
        `Your Token: ${token}`,
        "",
        `Use this token with your mobile number (${mobile || "registered number"}) to access the marriage registration form.`,
        "",
        "Steps to register:",
        "1. Go to the Registration page",
        "2. Enter your mobile number and token",
        "3. Click 'Access Form'",
        "4. Complete the registration",
        "",
        "Please keep this token safe. Each token can only be used once.",
        "",
        "Regards,",
        "Kamma Icon Trust",
      ].join("\n"),
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fffaf5; border-radius: 16px; overflow: hidden; border: 1px solid #f3e8dc;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f2d188, #e88db0); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 0.08em;">
              KAMMA ICON TRUST
            </h1>
            <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.85); letter-spacing: 0.15em; text-transform: uppercase;">
              Marriage Registration
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 36px 28px;">
            <p style="margin: 0 0 20px; font-size: 16px; color: #3d2e20; line-height: 1.6;">
              Dear <strong>${name || "User"}</strong>,
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; color: #5a4a3a; line-height: 1.6;">
              Your registration token has been generated successfully. Please use this token along with your mobile number to access the registration form.
            </p>

            <!-- Token Box -->
            <div style="background: #fff; border: 2px dashed #d4a054; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 28px;">
              <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #c48a3f;">
                Your Token
              </p>
              <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 0.12em; color: #2d1a0e;">
                ${token}
              </p>
            </div>

            <!-- Mobile Number -->
            ${mobile ? `
            <div style="background: #fef7ee; border-radius: 12px; padding: 14px 20px; margin: 0 0 24px; border: 1px solid #f3e2c8;">
              <p style="margin: 0; font-size: 13px; color: #8a7260;">
                <strong style="color: #5a4232;">Registered Mobile:</strong> ${mobile}
              </p>
            </div>
            ` : ""}

            <!-- Steps -->
            <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #3d2e20;">How to use your token:</p>
            <ol style="margin: 0 0 24px; padding-left: 20px; font-size: 14px; color: #5a4a3a; line-height: 2;">
              <li>Go to the Registration page</li>
              <li>Enter your mobile number and token</li>
              <li>Click <strong>"Access Form"</strong></li>
              <li>Complete the registration</li>
            </ol>

            <!-- Warning -->
            <div style="background: #fff5f5; border-radius: 12px; padding: 14px 20px; border: 1px solid #fde2e2;">
              <p style="margin: 0; font-size: 13px; color: #9b4444;">
                ⚠ Please keep this token safe. Each token can only be used once.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f0e8; padding: 20px 28px; text-align: center; border-top: 1px solid #f0e0d0;">
            <p style="margin: 0; font-size: 12px; color: #a08a74;">
              © ${new Date().getFullYear()} Kamma Icon Trust. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
