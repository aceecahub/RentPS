import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export const paymentService = {
    async createSnapToken(orderId, amount, customerDetails = {}) {
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            customer_details: customerDetails,
            enabled_payments: ["credit_card", "gopay", "shopeepay", "bank_transfer", "qris"],
            callbacks: {
                finish: `${process.env.APP_URL}/user/bookings`,
                error: `${process.env.APP_URL}/user/bookings`,
                pending: `${process.env.APP_URL}/user/bookings`
            }
        };

        if (process.env.APP_URL) {
            parameter.transaction_details.notification_url = `${process.env.APP_URL}/api/payment/webhook`;
        }

        try {
            const transaction = await snap.createTransaction(parameter);
            return transaction.token;
        } catch (error) {
            throw new Error(`Midtrans Service Error: ${error.message}`);
        }
    },

    async processWebhook(notification) {
        try {
            const statusResponse = await snap.transaction.notification(notification);
            const orderId = statusResponse.order_id;
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`);

            let paymentStatus = 'PENDING';

            if (transactionStatus == 'capture') {
                if (fraudStatus == 'challenge') {
                    paymentStatus = 'CHALLENGE';
                } else if (fraudStatus == 'accept') {
                    paymentStatus = 'SETTLEMENT';
                }
            } else if (transactionStatus == 'settlement') {
                paymentStatus = 'SETTLEMENT';
            } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
                paymentStatus = 'FAILED';
            } else if (transactionStatus == 'pending') {
                paymentStatus = 'PENDING';
            }

            return {
                orderId,
                paymentStatus,
                raw: statusResponse
            };
        } catch (error) {
            throw new Error(`Midtrans Webhook Error: ${error.message}`);
        }
    }
};