import prisma from "../prisma/client.js"

export const createBooking = async (inputData) => {
    const {
        userId, mitraId, unitId, startTime, endTime, 
        durationHour, totalPrice, renterName, renterNik, 
        renterPhone, renterPhoto, snacks 
    } = inputData

    try {
        return await prisma.$transaction(async (tx) => {
            // 0. Check Overlap
            const startDate = new Date(startTime)
            const endDate = new Date(endTime)

            const overlap = await tx.booking.findFirst({
                where: {
                    unitId: parseInt(unitId),
                    status: { notIn: ["CANCELLED"] },
                    AND: [
                        { startTime: { lt: endDate } },
                        { endTime: { gt: startDate } }
                    ]
                }
            })

            if (overlap) {
                throw new Error("Unit PS sudah dibooking pada waktu tersebut.")
            }

            // 1. Booking & BookingSnack
            const booking = await tx.booking.create({
                data: {
                    userId: parseInt(userId),
                    mitraId: parseInt(mitraId),
                    unitId: parseInt(unitId),
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    durationHour: parseInt(durationHour),
                    totalPrice: parseFloat(totalPrice),
                    renterName,
                    renterNik,
                    renterPhone,
                    renterPhoto,
                    status: "WAITING_PAYMENT",
                    ...(snacks && snacks.length > 0 && {
                        snacks: {
                            create: snacks.map((s) => ({
                                snackId: parseInt(s.snackId),
                                quantity: parseInt(s.quantity),
                                priceAtBooking: parseFloat(s.priceAtBooking)
                            }))
                        }
                    })
                },
                include: { snacks: true }
            });

            // 2. Update Stok Snack (Looping)
            if (snacks && snacks.length > 0) {
                for (const item of snacks) {
                    const updatedSnack = await tx.snack.update({
                        where: { id: parseInt(item.snackId) },
                        data: {
                            stock: { decrement: parseInt(item.quantity) }
                        }
                    });

                    // Validasi jika stok habis mendadak
                    if (updatedSnack.stock < 0) {
                        throw new Error(`Stok ${updatedSnack.name} tidak mencukupi.`)
                    }
                }
            }

            return booking
        })
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getBookingById = async (id) => {
    try {
        return await prisma.booking.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { name: true, email: true } },
                mitra: true,
                unit: true,
                snacks: {
                    include: { snack: true }
                },
                payment: true
            }
        })
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getUserBookings = async (userId) => {
    try {
        return await prisma.booking.findMany({
            where: { userId: parseInt(userId) },
            include: {
                mitra: true,
                unit: true,
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getMitraBookings = async (mitraId) => {
    try {
        return await prisma.booking.findMany({
            where: { mitraId: parseInt(mitraId) },
            include: {
                user: { select: { name: true, email: true } },
                unit: true,
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        throw new Error(error.message)
    }
}

export const updateBookingStatus = async (id, status) => {
    try {
        return await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status }
        })
    } catch (error) {
        throw new Error(error.message)
    }
}
