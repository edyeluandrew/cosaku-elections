import http from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { initializeSocket } from "./sockets/socket.js";
import { initializeDatabase } from "./utils/initDb.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { verifyEmailConnection } from "./utils/email.js";

const server = http.createServer(app);
const io = initializeSocket(server, config);

// Make io available globally for controllers
global.io = io;

const PORT = config.port;

const startServer = async () => {
  try {
    // Initialize database
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("✓ Database initialized successfully");

    // Verify email service
    console.log("Checking email service...");
    await verifyEmailConnection();

    // Seed admin if not exists
    console.log("Setting up admin account...");
    await seedAdmin();

    // Start server
    server.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ Client URL: ${config.clientUrl}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

startServer();
