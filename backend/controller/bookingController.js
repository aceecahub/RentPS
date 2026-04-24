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
        const bookings = await bookingService.getUserBookings(req.body.userId)
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
        const mitra = await findMitraByUserId(req.body.userId)
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
