// Image processing utilities without ML dependencies
// Note: Background removal has been disabled for deployment compatibility
// Consider integrating with external API services like remove.bg or similar

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Background removal: ML dependencies removed for deployment compatibility.');
    console.log('Returning original image. Consider integrating with external API services like remove.bg');
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Return original image as blob (without background removal)
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created image blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Image enhancement utilities
export const enhanceImageForAnalysis = (canvas: HTMLCanvasElement): ImageData => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Apply brightness and contrast adjustments for better face detection
  const brightness = 10;
  const contrast = 1.1;
  
  for (let i = 0; i < data.length; i += 4) {
    // Adjust brightness and contrast
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));     // R
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness)); // G
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness)); // B
  }
  
  ctx.putImageData(imageData, 0, 0);
  return imageData;
};

// Utility to extract dominant colors from image
export const extractDominantColors = (canvas: HTMLCanvasElement): string[] => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colorMap = new Map<string, number>();
  
  // Sample every 10th pixel to improve performance
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    // Skip transparent pixels
    if (alpha < 128) continue;
    
    // Group similar colors
    const groupedR = Math.floor(r / 32) * 32;
    const groupedG = Math.floor(g / 32) * 32;
    const groupedB = Math.floor(b / 32) * 32;
    
    const colorKey = `rgb(${groupedR},${groupedG},${groupedB})`;
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
  }
  
  // Return top 5 most frequent colors
  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);
};

// Convert RGB to HSL for better color analysis
export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return [h * 360, s * 100, l * 100];
};

// Analyze skin tone from face region
export const analyzeSkinTone = (faceRegion: ImageData): string => {
  const data = faceRegion.data;
  let totalR = 0, totalG = 0, totalB = 0, count = 0;
  
  for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
    const alpha = data[i + 3];
    if (alpha > 128) { // Skip transparent pixels
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }
  
  if (count === 0) return '#F1C27D'; // Default skin tone
  
  const avgR = Math.round(totalR / count);
  const avgG = Math.round(totalG / count);
  const avgB = Math.round(totalB / count);
  
  return `rgb(${avgR}, ${avgG}, ${avgB})`;
};

// Create thumbnail from processed image
export const createThumbnail = (canvas: HTMLCanvasElement, size: number = 128): string => {
  const thumbnailCanvas = document.createElement('canvas');
  const ctx = thumbnailCanvas.getContext('2d');
  if (!ctx) return '';
  
  thumbnailCanvas.width = size;
  thumbnailCanvas.height = size;
  
  // Draw the original canvas scaled to thumbnail size
  ctx.drawImage(canvas, 0, 0, size, size);
  
  return thumbnailCanvas.toDataURL('image/jpeg', 0.8);
};
