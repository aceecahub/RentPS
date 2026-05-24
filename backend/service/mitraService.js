import prisma from '../prisma/client.js'
import bcrypt from "bcrypt"

export const registerMitra = async (inputData) => {
    const { 
        email, password, name, 
        shopName, address, latitude, longitude,
        nik, npwp, identityPhoto, // Data untuk Approval
        photos // Array URL foto bangunan/ruangan PS
    } = inputData

    const hashedPassword = await bcrypt.hash(password, 10)

    return await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'MITRA',
            mitraProfile: {
                create: {
                    shopName,
                    address,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    nik,
                    npwp,
                    identityPhoto, // Foto KTP
                    approvalStatus: 'PENDING',
                    // Relasi ke tabel MitraPhoto
                    photos: {
                        create: photos && photos.length > 0 ? photos.map((url, index) => ({
                            photoUrl: url,
                            isMain: index === 0,
                            caption: `Foto Ruangan ${index + 1}`
                        })) : []
                    }
                }
            }
        },
        include: {
            mitraProfile: {
                include: {
                    photos: true
                }
            }
        }
    })
}


export const updateApprovalStatus = async (mitraId, approvalStatus, rejectionReason = null) => {
    return await prisma.mitraProfile.update({
        where: { id: parseInt(mitraId) },
        data: { 
            approvalStatus: approvalStatus,
            rejectionReason: rejectionReason 
        },
    })
}


export const manualCloseAndOpen = async (mitraId, isManualClosed, manualCloseReason = null) => {
    return await prisma.mitraProfile.update({
        where: { id: parseInt(mitraId) },
        data: { 
            isManualClosed: isManualClosed,
            manualCloseReason: manualCloseReason 
        },
    })
}

export const operatingHours = async (mitraId, day, openTime, closeTime, isOpen) => {
    return await prisma.operatingHour.create({
        data: {
            mitraId: parseInt(mitraId),
            day: day,
            openTime: openTime,
            closeTime: closeTime,
            isOpen: isOpen
        }
    })
}

export const findMitraByUserId = async (userId) => {
    return await prisma.mitraProfile.findUnique({
        where: { userId: parseInt(userId) }
    })
}

export const getIncomeReport = async (mitraId, { startDate, endDate, period }) => {
    let whereClause = {
        mitraId: parseInt(mitraId),
        status: 'COMPLETED'
    };

    const now = new Date();
    
    if (period === 'day') {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.updatedAt = { gte: startOfDay, lte: endOfDay };
    } else if (period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        whereClause.updatedAt = { gte: startOfMonth, lte: endOfMonth };
    } else if (period === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        whereClause.updatedAt = { gte: startOfYear, lte: endOfYear };
    } else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.updatedAt = {
            gte: start,
            lte: end
        };
    }

    const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
            snacks: {
                include: {
                    snack: true
                }
            },
            unit: true,
            user: {
                select: { name: true }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    let totalPsIncome = 0;
    let totalSnackIncome = 0;

    const formattedBookings = bookings.map(booking => {
        const snackIncome = booking.snacks.reduce((sum, item) => {
            return sum + (parseFloat(item.priceAtBooking) * item.quantity);
        }, 0);
        
        const psIncome = parseFloat(booking.unit.pricePerHour) * booking.durationHour;
        
        return {
            id: booking.id,
            customerName: booking.user.name,
            unitName: booking.unit.name,
            date: booking.updatedAt,
            psIncome,
            snackIncome,
            totalIncome: psIncome + snackIncome,
            snacks: booking.snacks.map(s => ({
                name: s.snack.name,
                quantity: s.quantity,
                price: s.priceAtBooking
            }))
        };
    });

    formattedBookings.forEach(b => {
        totalPsIncome += b.psIncome;
        totalSnackIncome += b.snackIncome;
    });

    return {
        totalIncome: totalPsIncome + totalSnackIncome,
        psIncome: totalPsIncome,
        snackIncome: totalSnackIncome,
        bookingCount: bookings.length,
        bookings: formattedBookings,
        period: period || 'custom',
        startDate: startDate || null,
        endDate: endDate || null
    };
}