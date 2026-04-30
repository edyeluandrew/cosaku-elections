import dotenv from "dotenv";

dotenv.config();

// CLIENT_URL can be a single URL or comma-separated list of allowed origins
const clientUrlRaw = process.env.CLIENT_URL || "http://localhost:5173";
const clientUrls = clientUrlRaw
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "your_secret_key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: clientUrls[0],
  clientUrls,
  // Brevo API configuration - do not expose API key in logs
  emailProvider: process.env.EMAIL_PROVIDER || "brevo",
  uploadDir: process.env.UPLOAD_DIR || "src/uploads",
  defaultAdminName: process.env.DEFAULT_ADMIN_NAME,
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL,
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
};

export default config;
