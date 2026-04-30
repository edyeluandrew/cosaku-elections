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
 * @returns {Promise<object>} - Object with optimized image info
 */
export const optimizeImage = async (inputPath, outputDir) => {
  try {
    // Get file info
    const filename = path.basename(inputPath);
    const ext = path.extname(filename).toLowerCase();

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
    const jpegPath = path.join(outputDir, filename.replace(ext, ".jpg"));

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

    // If original was JPG, we can delete it
    if (ext.toLowerCase() === ".jpg" || ext.toLowerCase() === ".jpeg") {
      fs.unlinkSync(inputPath);
      console.log("🗑️  Removed original image file");
    }

    return {
      filename: path.basename(jpegPath),
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      compressed: true,
      compression: `${compression}%`,
    };
  } catch (error) {
    console.error("Image optimization failed:", error.message);
    // If optimization fails, fall back to original
    console.log("⚠️  Optimization failed, using original image");
    return {
      filename: path.basename(inputPath),
      optimized: false,
      error: error.message,
    };
  }
};

export default { optimizeImage };
