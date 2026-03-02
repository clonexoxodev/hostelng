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
      const fontSize = Math.max(img.width * 0.04, 20); // Responsive font size
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add watermark text
      const watermarkText = 'HostelNG';
      
      // Calculate position (bottom-right corner)
      const padding = fontSize;
      const x = canvas.width - padding;
      const y = canvas.height - padding;

      // Draw text with stroke (outline) for better visibility
      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);

      // Add logo watermark if available
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = '/logo.png';
      
      logo.onload = () => {
        // Draw logo in bottom-left corner
        const logoSize = Math.max(img.width * 0.08, 40);
        const logoPadding = fontSize / 2;
        
        // Add semi-transparent background for logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(
          logoPadding - 5,
          canvas.height - logoSize - logoPadding - 5,
          logoSize + 10,
          logoSize + 10
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
