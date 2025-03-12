import { app } from './src/app.js';
import https from 'https';
import http from 'http';
import config from './src/config/config.js';


let server;
if (config.protocol === 'https') {
    server = https.createServer(app);
} else {
    server = http.createServer(app);
}


server.listen(config.PORT, () => {
    console.log(`server is listening on port ${config.PORT}`);
});
