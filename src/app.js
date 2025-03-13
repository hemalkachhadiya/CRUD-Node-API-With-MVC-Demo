import express from 'express';
import cors from 'cors';
import con from './database/mongoDB.js';
import path from 'path';
import helmet from 'helmet';
const app = express();

if (con) console.log("Database connected successfully");

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: false
    })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import routes_v1 from './routes/index.js';

app.use('/api/v1/', routes_v1);

export { app };