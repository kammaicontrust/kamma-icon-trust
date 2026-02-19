// "use server";

// import fs from "fs";
// import path from "path";
// import PDFDocument from "pdfkit";

// export async function generateReceipt(donation) {
//   const receiptsDir = path.join(process.cwd(), "public", "receipts");

//   if (!fs.existsSync(receiptsDir)) {
//     fs.mkdirSync(receiptsDir, { recursive: true });
//   }

//   const fileName = `receipt-${donation.id}.pdf`;
//   const filePath = path.join(receiptsDir, fileName);

//   const doc = new PDFDocument();
//   const stream = fs.createWriteStream(filePath);

//   doc.pipe(stream);

//   doc.fontSize(18).text("Kamma Icon Trust", { align: "center" });
//   doc.moveDown();

//   doc.fontSize(12).text(`Name: ${donation.name}`);
//   doc.text(`Phone: ${donation.phone}`);
//   doc.text(`Amount: ₹${donation.amount}`);
//   doc.text(`Transaction ID: ${donation.txnId}`);
//   doc.text(`Date: ${new Date().toLocaleString()}`);

//   doc.end();

//   await new Promise((resolve) => stream.on("finish", resolve));

//   return {
//     receiptUrl: `/receipts/${fileName}`,
//     receiptNumber: donation.id,
//   };
// }
