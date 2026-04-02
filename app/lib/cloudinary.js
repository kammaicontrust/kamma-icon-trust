export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return res.json();
};
