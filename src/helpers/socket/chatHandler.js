/**
 * Handle chat-related socket events
 * @param {Server} io - Socket.io server instance
 * @param {Socket} socket - Socket instance for the current connection
 */
export const handleChatEvents = (io, socket) => {
    // Join a chat room
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit('user_joined', {
            userId: socket.id,
            message: `A new user has joined the chat`
        });
    });

    // Leave a chat room
    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room: ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit('user_left', {
            userId: socket.id,
            message: `A user has left the chat`
        });
    });

    // Send message to a room
    socket.on('send_message', (data) => {
        console.log(`Message in room ${data.roomId}: ${data.message}`);

        // Add timestamp to the message
        const messageWithTime = {
            ...data,
            timestamp: new Date().toISOString(),
            senderId: socket.id
        };

        // Broadcast message to everyone in the room
        io.to(data.roomId).emit('receive_message', messageWithTime);
    });

    // User typing indicator
    socket.on('typing', (data) => {
        socket.to(data.roomId).emit('user_typing', {
            userId: socket.id,
            isTyping: data.isTyping
        });
    });
};