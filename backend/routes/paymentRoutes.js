import express from 'express';
import * as paymentController from '../controller/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-transaction', verifyToken, paymentController.createTransaction);
router.post('/webhook', paymentController.handleMidtransWebhook);

export default router;
