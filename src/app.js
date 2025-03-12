import express from 'express';
import cors from 'cors';
import con from './database/mongoDB.js';
import helmet from 'helmet';
const app = express();

if (con) console.log("Database connected successfully");

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