import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Gallery =
  mongoose.models.Gallery ||
  mongoose.model("Gallery", GallerySchema);

export default Gallery;
