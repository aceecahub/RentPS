import prisma from "../prisma/client.js"

export const createReview = async (req, res) => {
    try {
        const { bookingId } = req.params
        const { rating, comment, userId } = req.body

        // Verify booking exists and belongs to user and is COMPLETED
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) }
        })

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking tidak ditemukan" })
        }

        if (booking.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, message: "Booking harus selesai terlebih dahulu" })
        }

        // Check if already reviewed
        const existingReview = await prisma.review.findUnique({
            where: { bookingId: parseInt(bookingId) }
        })

        if (existingReview) {
            return res.status(400).json({ success: false, message: "Anda sudah mereview booking ini" })
        }

        const review = await prisma.review.create({
            data: {
                bookingId: parseInt(bookingId),
                userId: parseInt(userId),
                mitraId: booking.mitraId,
                rating: parseInt(rating),
                comment
            }
        })

        res.status(201).json({
            success: true,
            message: "Review berhasil ditambahkan",
            data: review
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getMitraReviews = async (req, res) => {
    try {
        const { mitraId } = req.params
        const reviews = await prisma.review.findMany({
            where: { mitraId: parseInt(mitraId) },
            include: {
                user: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.status(200).json({
            success: true,
            data: reviews
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
