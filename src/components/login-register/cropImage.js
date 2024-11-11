// Create an image element from the file URL
export const loadImage = (url) => new Promise((resolve, reject) => { // Renamed from createImage to loadImage
  const image = new Image();
  image.addEventListener('load', () => resolve(image));
  image.addEventListener('error', (error) => reject(error));
  image.setAttribute('crossOrigin', 'anonymous'); // For CORS
  image.src = url;
});

// Crop the image using the canvas API
export const getCroppedImg = (imageSrc, croppedAreaPixels) => new Promise(async (resolve) => {
  const image = await loadImage(URL.createObjectURL(imageSrc)); 
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  canvas.toBlob((blob) => {
    resolve(blob);
  }, 'image/jpeg');
});
