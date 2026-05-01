/**
 * Resolve image URLs to ensure they're correctly formatted
 * Handles both relative and absolute paths
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Get the base API URL (without /api suffix)
 */
export const getBaseApiUrl = () => {
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const cleaned = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  console.log("📍 Base API URL:", cleaned);
  return cleaned;
};

/**
 * Resolve a candidate image URL to an absolute path
 * @param {string} imageUrl - The image URL from the API (e.g., "/uploads/filename.jpg")
 * @returns {string|null} - The absolute URL or null if imageUrl is falsy
 */
export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    console.log("✓ Already absolute URL:", imageUrl);
    return imageUrl;
  }

  // Get base API URL
  const baseUrl = getBaseApiUrl();

  // If it's a relative path, prepend the base API URL
  if (imageUrl.startsWith("/")) {
    const resolved = `${baseUrl}${imageUrl}`;
    console.log("✓ Resolved relative URL:", imageUrl, "→", resolved);
    return resolved;
  }

  // Otherwise, treat it as a relative path from the base API URL
  const resolved = `${baseUrl}/${imageUrl}`;
  console.log("✓ Resolved path:", imageUrl, "→", resolved);
  return resolved;
};

/**
 * Check if an image URL is valid and accessible
 * @param {string} imageUrl - The image URL to check
 * @returns {Promise<boolean>} - Whether the image is accessible
 */
export const validateImageUrl = async (imageUrl) => {
  if (!imageUrl) return false;

  try {
    const resolvedUrl = resolveImageUrl(imageUrl);
    if (!resolvedUrl) return false;

    const response = await fetch(resolvedUrl, {
      method: "HEAD",
      mode: "cors",
    });
    console.log(`✓ Image validation for ${imageUrl}: ${response.ok}`);
    return response.ok;
  } catch (error) {
    console.warn(
      `⚠️ Image validation failed for ${imageUrl}:`,
      error.message
    );
    return false;
  }
};

export default {
  getBaseApiUrl,
  resolveImageUrl,
  validateImageUrl,
};
