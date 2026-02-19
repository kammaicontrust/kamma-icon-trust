
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
 
  const images = await Gallery.find().sort({ createdAt: -1 });
  return Response.json(images);
}

export async function POST(req) {
 

  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads");
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  const saved = await Gallery.create({
    imageUrl: `/uploads/${fileName}`,
  });

  return Response.json(saved);
}
