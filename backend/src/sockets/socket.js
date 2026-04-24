import { Server } from "socket.io";

export const initializeSocket = (server, config) => {
  const allowedOrigins = config.clientUrls || [config.clientUrl];
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_election", (electionId) => {
      socket.join(`election:${electionId}`);
      console.log(`User ${socket.id} joined election: ${electionId}`);
    });

    socket.on("leave_election", (electionId) => {
      socket.leave(`election:${electionId}`);
      console.log(`User ${socket.id} left election: ${electionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitResultsUpdate = (io, electionId, results) => {
  io.to(`election:${electionId}`).emit("results:update", {
    electionId,
    results,
    timestamp: new Date(),
  });
};

export default initializeSocket;
