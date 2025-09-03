import sharp from 'sharp';

// Image processing configuration
const IMAGE_QUALITY = {
  jpeg: 85,
  webp: 80,
  png: 9 // compression level 0-9
};

const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 }
};

// Interface for image processing options
interface ProcessImageOptions {
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxWidth?: number;
  maxHeight?: number;
  thumbnail?: keyof typeof THUMBNAIL_SIZES | { width: number; height: number };
}

// Interface for processed image result
interface ProcessedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

// Main image processing function
export const processImage = async (
  inputBuffer: Buffer,
  options: ProcessImageOptions = {}
): Promise<ProcessedImage> => {
  try {
    const {
      quality = IMAGE_QUALITY.jpeg,
      format = 'jpeg',
      maxWidth = 2000,
      maxHeight = 2000
    } = options;
    
    let processor = sharp(inputBuffer);
    
    // Get original image metadata
    const metadata = await processor.metadata();
    
    // Resize if dimensions exceed limits
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        processor = processor.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
    }
    
    // Apply format-specific processing
    switch (format) {
      case 'jpeg':
        processor = processor.jpeg({ 
          quality,
          progressive: true,
          mozjpeg: true 
        });
        break;
      case 'webp':
        processor = processor.webp({ 
          quality,
          effort: 6 
        });
        break;
      case 'png':
        processor = processor.png({ 
          compressionLevel: quality as number,
          progressive: true 
        });
        break;
    }
    
    // Process the image
    const processedBuffer = await processor.toBuffer();
    const processedMetadata = await sharp(processedBuffer).metadata();
    
    return {
      buffer: processedBuffer,
      format,
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
      size: processedBuffer.length
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// Generate thumbnail
export const generateThumbnail = async (
  inputBuffer: Buffer,
  size: keyof typeof THUMBNAIL_SIZES | { width: number; height: number } = 'medium',
  options: { quality?: number; format?: 'jpeg' | 'webp' | 'png' } = {}
): Promise<ProcessedImage> => {
  try {
    const { quality = IMAGE_QUALITY.jpeg, format = 'jpeg' } = options;
    
    // Determine thumbnail dimensions
    const dimensions = typeof size === 'string' ? THUMBNAIL_SIZES[size] : size;
    
    let processor = sharp(inputBuffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      });
    
    // Apply format-specific processing
    switch (format) {
      case 'jpeg':
        processor = processor.jpeg({ 
          quality,
          progressive: true 
        });
        break;
      case 'webp':
        processor = processor.webp({ 
          quality,
          effort: 6 
        });
        break;
      case 'png':
        processor = processor.png({ 
          compressionLevel: quality as number 
        });
        break;
    }
    
    const thumbnailBuffer = await processor.toBuffer();
    const metadata = await sharp(thumbnailBuffer).metadata();
    
    return {
      buffer: thumbnailBuffer,
      format,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: thumbnailBuffer.length
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

// Optimize image for web
export const optimizeForWeb = async (
  inputBuffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    generateWebP?: boolean;
  } = {}
): Promise<{ jpeg: ProcessedImage; webp?: ProcessedImage }> => {
  try {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = IMAGE_QUALITY.jpeg,
      generateWebP = true
    } = options;
    
    // Generate optimized JPEG
    const jpeg = await processImage(inputBuffer, {
      format: 'jpeg',
      quality,
      maxWidth,
      maxHeight
    });
    
    const result: { jpeg: ProcessedImage; webp?: ProcessedImage } = { jpeg };
    
    // Generate WebP version if requested
    if (generateWebP) {
      result.webp = await processImage(inputBuffer, {
        format: 'webp',
        quality: IMAGE_QUALITY.webp,
        maxWidth,
        maxHeight
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error optimizing image for web:', error);
    throw new Error('Failed to optimize image for web');
  }
};

// Extract image metadata
export const extractMetadata = async (inputBuffer: Buffer) => {
  try {
    const metadata = await sharp(inputBuffer).metadata();
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: inputBuffer.length,
      density: metadata.density || 72,
      hasAlpha: metadata.hasAlpha || false,
      aspectRatio: metadata.width && metadata.height 
        ? Number((metadata.width / metadata.height).toFixed(2))
        : 0,
      colorSpace: metadata.space || 'unknown'
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw new Error('Failed to extract image metadata');
  }
};

// Validate image file
export const validateImage = async (inputBuffer: Buffer): Promise<{
  valid: boolean;
  errors: string[];
  metadata?: any;
}> => {
  const errors: string[] = [];
  
  try {
    // Check if it's a valid image
    const metadata = await sharp(inputBuffer).metadata();
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (inputBuffer.length > maxSize) {
      errors.push(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }
    
    // Check dimensions (max 5000x5000)
    const maxDimension = 5000;
    if (metadata.width && metadata.width > maxDimension) {
      errors.push(`Image width too large. Maximum width is ${maxDimension}px`);
    }
    if (metadata.height && metadata.height > maxDimension) {
      errors.push(`Image height too large. Maximum height is ${maxDimension}px`);
    }
    
    // Check format
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    if (metadata.format && !allowedFormats.includes(metadata.format.toLowerCase())) {
      errors.push(`Unsupported format. Allowed formats: ${allowedFormats.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      metadata
    };
  } catch (error) {
    errors.push('Invalid image file or corrupted data');
    return {
      valid: false,
      errors
    };
  }
};

// Generate multiple sizes for responsive images
export const generateResponsiveSizes = async (
  inputBuffer: Buffer,
  sizes: number[] = [400, 800, 1200, 1600],
  options: { format?: 'jpeg' | 'webp'; quality?: number } = {}
): Promise<{ size: number; image: ProcessedImage }[]> => {
  try {
    const { format = 'jpeg', quality = IMAGE_QUALITY.jpeg } = options;
    
    const results = await Promise.all(
      sizes.map(async (size) => ({
        size,
        image: await processImage(inputBuffer, {
          format,
          quality,
          maxWidth: size,
          maxHeight: size
        })
      }))
    );
    
    return results;
  } catch (error) {
    console.error('Error generating responsive sizes:', error);
    throw new Error('Failed to generate responsive image sizes');
  }
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateCompressionRatio = (originalSize: number, compressedSize: number): number => {
  return Number(((1 - compressedSize / originalSize) * 100).toFixed(1));
};