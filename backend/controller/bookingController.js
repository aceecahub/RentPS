import prisma from "../prisma/client.js"
import * as bookingService from "../service/bookingService.js"
import { findMitraByUserId } from "../service/mitraService.js" // Assuming this exists to get mitraId from userId

export const createBooking = async (req, res) => {
    try {
        const booking = await bookingService.createBooking({
            ...req.body,
            userId: req.body.userId // from auth middleware
        })
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const getBookingById = async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id)
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            })
        }
        res.status(200).json({
            success: true,
            data: booking
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.query.userId || req.body.userId
        const bookings = await bookingService.getUserBookings(userId)
        res.status(200).json({
            success: true,
            data: bookings
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getMitraBookings = async (req, res) => {
    try {
        const userId = req.query.userId || req.body.userId
        const mitra = await findMitraByUserId(userId)
        if (!mitra) {
            return res.status(404).json({
                success: false,
                message: "Mitra profile not found"
            })
        }
        
        const bookings = await bookingService.getMitraBookings(mitra.id)
        res.status(200).json({
            success: true,
            data: bookings
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body
        const booking = await bookingService.updateBookingStatus(req.params.id, status)
        res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            data: booking
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const getUnitSchedule = async (req, res) => {
    try {
        const { unitId } = req.params;
        const date = req.query.date;

        // Fetch bookings for this unit that are not cancelled
        // We only return startTime and endTime for privacy
        const bookings = await prisma.booking.findMany({
            where: {
                unitId: unitId,
                status: { notIn: ["CANCELLED"] },
                ...(date && {
                    startTime: {
                        gte: new Date(`${date}T00:00:00.000Z`),
                        lt: new Date(`${date}T23:59:59.999Z`)
                    }
                })
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
