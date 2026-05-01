import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Optimize uploaded candidate image
 * - Compress to reduce file size
 * - Convert to modern formats
 * - Maintain aspect ratio
 * @param {string} inputPath - Full path to uploaded image
 * @param {string} outputDir - Directory to save optimized image
 * @param {string} suggestedFilename - Suggested filename (e.g., from multer)
 * @returns {Promise<object>} - Object with optimized image info
 */
export const optimizeImage = async (inputPath, outputDir, suggestedFilename = null) => {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log("📁 Created uploads directory:", outputDir);
    }

    // Get file info
    const originalFilename = suggestedFilename || path.basename(inputPath);
    const ext = path.extname(originalFilename).toLowerCase();

    // Read image to get dimensions
    const metadata = await sharp(inputPath).metadata();
    console.log(`📊 Image metadata: ${metadata.width}x${metadata.height}px, format: ${metadata.format}`);

    // Determine if we should resize (if image is very large)
    let shouldResize = false;
    if (metadata.width > 1200 || metadata.height > 1200) {
      shouldResize = true;
      console.log("📐 Image is large, will resize for web");
    }

    // Optimize the image
    let pipeline = sharp(inputPath);

    // Resize if needed (max 1200px on largest dimension, maintain aspect ratio)
    if (shouldResize) {
      pipeline = pipeline.resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Compress based on format
    const jpegPath = path.join(outputDir, originalFilename.replace(ext, ".jpg"));

    await pipeline
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(jpegPath);

    // Get optimized file size
    const stats = fs.statSync(jpegPath);
    const originalStats = fs.statSync(inputPath);
    const compression = (
      ((originalStats.size - stats.size) / originalStats.size) *
      100
    ).toFixed(1);

    console.log(
      `✓ Image optimized: ${(originalStats.size / 1024).toFixed(2)}KB → ${(stats.size / 1024).toFixed(2)}KB (${compression}% compression)`
    );
    console.log(`✓ Saved to: ${jpegPath}`);

    // Clean up original file from multer if it's not the optimized one
    if (inputPath !== jpegPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
      console.log("🗑️  Removed original temporary file");
    }

    const finalFilename = path.basename(jpegPath);
    console.log(`✓ Final filename: ${finalFilename}`);

    return {
      filename: finalFilename,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      compressed: true,
      compression: `${compression}%`,
    };
  } catch (error) {
    console.error("❌ Image optimization failed:", error.message);
    
    // If optimization fails, try to use the original file if it exists
    if (fs.existsSync(inputPath)) {
      const fallbackName = suggestedFilename || path.basename(inputPath);
      const fallbackPath = path.join(outputDir, fallbackName);
      
      try {
        // Copy the original file to uploads directory if needed
        if (inputPath !== fallbackPath) {
          fs.copyFileSync(inputPath, fallbackPath);
          console.log("✓ Used original image as fallback:", fallbackName);
        }
        return {
          filename: fallbackName,
          optimized: false,
          fallback: true,
          error: error.message,
        };
      } catch (copyError) {
        console.error("❌ Fallback copy failed:", copyError.message);
        throw error;
      }
    }
    
    throw error;
  }
};

export default { optimizeImage };
