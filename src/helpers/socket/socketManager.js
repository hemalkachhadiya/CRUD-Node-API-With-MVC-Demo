import { Server } from 'socket.io';
import { handleChatEvents } from './chatHandler.js';

/**
 * Initialize Socket.io server and set up event handlers
 * @param {Server} server - HTTP/HTTPS server instance
 * @return {Server} - Socket.io server instance
 */

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // You might want to restrict this in production
      methods: ["GET", "POST"]
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Set up chat event handlers
    handleChatEvents(io, socket);

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};