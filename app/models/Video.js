import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    link: {
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

// IMPORTANT: export the MODEL, not schema
const Video =
  mongoose.models.Video || mongoose.model("Video", VideoSchema);

export default Video;
