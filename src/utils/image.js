import { uploadImage } from 'src/services/image.js';
import notify from 'src/utils/notify.js'

export async function resizeImageIfTooBig(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, file.type);
    };
    img.onerror = function () {
      reject("Unable to load image.");
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function processImage(file, route, t) {
  // console.log(file);
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/tiff", "image/svg+xml"]
  const allowedExtensions = allowedTypes.map(type => type.split("/")[1]);
  // console.log(file.type);
  if (!allowedTypes.includes(file.type)) {
    notify({ message: t('invalidFileType', { allowedExtensions: allowedExtensions.join(", ") }), duration: 5 })
    return;
  }
  if (file.size > 1080 * 1024) {
    file = await resizeImageIfTooBig(file, 1080, 1080);
  }
  const res = await uploadImage(file, route);
  const imageUrl = res.imageUrl
  if (imageUrl) {
    return imageUrl;
  } else {
    throw new Error("no image");
  }
}
