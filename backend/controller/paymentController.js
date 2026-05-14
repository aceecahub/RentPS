import { paymentService } from '../service/paymentService.js';
import prisma from '../prisma/client.js';

export const createTransaction = async (req, res) => {
    try {
        const { bookingId } = req.body;

        // 1. Ambil data booking dari database
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: true }
        });

        if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });

        // 2. Minta Token ke Midtrans
        const token = await paymentService.createSnapToken(
            booking.id.toString(), 
            Number(booking.totalPrice), 
            { first_name: booking.renterName, email: booking.user.email }
        );

        // 3. Simpan record pembayaran ke database (Status PENDING) jika belum ada
        await prisma.payment.upsert({
            where: { bookingId: booking.id },
            update: {
                amount: booking.totalPrice,
                status: 'PENDING'
            },
            create: {
                bookingId: booking.id,
                amount: booking.totalPrice,
                status: 'PENDING'
            }
        });

        return res.status(200).json({ status: 'success', token: token });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const handleMidtransWebhook = async (req, res) => {
    try {
        const result = await paymentService.processWebhook(req.body);
        const { orderId, paymentStatus } = result;

        console.log(`Processing webhook for Order ID: ${orderId}, Status: ${paymentStatus}`);

        // Update Payment Status
        const updatedPayment = await prisma.payment.update({
            where: { bookingId: orderId },
            data: { 
                status: paymentStatus === 'SETTLEMENT' ? 'SETTLEMENT' : 
                        paymentStatus === 'FAILED' ? 'FAILED' : 'PENDING',
                paidAt: paymentStatus === 'SETTLEMENT' ? new Date() : null
            }
        });

        // If payment is settled, update Booking Status to CONFIRMED
        if (paymentStatus === 'SETTLEMENT') {
            await prisma.booking.update({
                where: { id: orderId },
                data: { status: 'CONFIRMED' }
            });
        } else if (paymentStatus === 'FAILED') {
            await prisma.booking.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });
        }

        return res.status(200).json({ status: 'success', message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};