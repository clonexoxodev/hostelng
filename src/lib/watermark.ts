/**
 * Add HostelNG watermark to an image
 * @param file - The image file to watermark
 * @returns Promise<Blob> - The watermarked image as a Blob
 */
export const addWatermark = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark style
      const fontSize = Math.max(img.width * 0.05, 24); // Larger, more visible font
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; // More opaque
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'; // Darker outline
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add watermark text
      const watermarkText = 'HostelNG';
      
      // Calculate position (centered horizontally, 70% down vertically)
      const x = canvas.width / 2;
      const y = canvas.height * 0.7;

      // Draw text with stroke (outline) for better visibility
      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);

      // Add logo watermark if available
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = '/logo.png';
      
      logo.onload = () => {
        // Draw logo in bottom-left corner, closer to edge
        const logoSize = Math.max(img.width * 0.1, 50); // Larger logo
        const logoPadding = fontSize * 0.3; // Reduced padding
        
        // Add semi-transparent background for logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // More opaque background
        ctx.fillRect(
          logoPadding - 4,
          canvas.height - logoSize - logoPadding - 4,
          logoSize + 8,
          logoSize + 8
        );
        
        // Draw logo
        ctx.drawImage(
          logo,
          logoPadding,
          canvas.height - logoSize - logoPadding,
          logoSize,
          logoSize
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          file.type || 'image/jpeg',
          0.92 // Quality (0-1)
        );
      };

      logo.onerror = () => {
        // If logo fails to load, just use text watermark
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          file.type || 'image/jpeg',
          0.92
        );
      };
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Process multiple images and add watermarks
 * @param files - Array of image files
 * @returns Promise<File[]> - Array of watermarked image files
 */
export const watermarkImages = async (files: File[]): Promise<File[]> => {
  const watermarkedFiles: File[] = [];

  for (const file of files) {
    try {
      const watermarkedBlob = await addWatermark(file);
      
      // Convert blob back to File
      const watermarkedFile = new File(
        [watermarkedBlob],
        file.name,
        { type: file.type }
      );
      
      watermarkedFiles.push(watermarkedFile);
    } catch (error) {
      console.error('Failed to watermark image:', error);
      // If watermarking fails, use original image
      watermarkedFiles.push(file);
    }
  }

  return watermarkedFiles;
};
