/**
 * Compresses an image using the HTML5 Canvas API.
 * Resizes the image to a maximum width/height while maintaining aspect ratio,
 * and converts it to a highly optimized WebP format to reduce base64 size.
 *
 * @param file The image file from the input event
 * @param maxWidth The maximum width of the compressed image (default: 200)
 * @param maxHeight The maximum height of the compressed image (default: 200)
 * @param quality The quality of the WebP output from 0 to 1 (default: 0.8)
 * @returns A promise that resolves to the compressed base64 string
 */
export const compressImage = (
  file: File,
  maxWidth = 200,
  maxHeight = 200,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate the new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to highly optimized webp format
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
