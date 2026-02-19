




export async function GET() {
  try {
    
    const videos = await Video.find().sort({ order: 1 });
    return Response.json(videos);
  } catch (err) {
    console.error("GET /api/videos error:", err);
    return Response.json([]);
  }
}

export async function POST(req) {
  try {
    
    const { link } = await req.json();

    if (!link) {
      return Response.json({ error: "No link" }, { status: 400 });
    }

    const count = await Video.countDocuments();
    await Video.create({ link, order: count });

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/videos error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
   
    const { id } = await req.json();

    if (!id) {
      return Response.json({ error: "No id" }, { status: 400 });
    }

    await Video.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/videos error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
