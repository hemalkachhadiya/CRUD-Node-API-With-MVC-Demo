import { app } from './src/app.js';
import https from 'https';
import http from 'http';
import config from './src/config/config.js';
import { initializeSocket } from './src/helpers/socket/index.js';

let server;
if (config.protocol === 'https') {
    server = https.createServer(app);
} else {
    server = http.createServer(app);
}

// Initialize Socket.io with the server
const io = initializeSocket(server);

// Export io if needed elsewhere in your application
export { io };

server.listen(config.PORT, () => {
    console.log(`Server is listening on port ${config.PORT}`);
    console.log(`Socket.io server is also running`);
});