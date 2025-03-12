import express from 'express';
import authRoutes from './user/auth.js';

const router = express.Router();

router.use('/user', authRoutes);

export default router;
