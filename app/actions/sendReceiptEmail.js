// "use server";

// import nodemailer from "nodemailer";

// export async function sendReceiptEmail({
//   email,
//   name,
//   receiptUrl,
//   receiptNumber,
// }) {
//   if (!email) {
//     console.log("No email found. Skipping email.");
//     return;
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: `"Kamma Icon Trust" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Donation Receipt – Kamma Icon Trust",
//     html: `
//       <p>Dear ${name},</p>

//       <p>Thank you for your generous donation.</p>

//       <p>
//         Your receipt is available here:<br/>
//         <a href="${process.env.NEXT_PUBLIC_BASE_URL}${receiptUrl}">
//           Download Receipt
//         </a>
//       </p>

//       <p>
//         Regards,<br/>
//         <b>Kamma Icon Trust</b>
//       </p>
//     `,
//   });
// }
