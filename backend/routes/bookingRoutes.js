import express from "express"
import * as bookingController from "../controller/bookingController.js"
import * as reviewController from "../controller/reviewController.js"
import { verifyToken } from "../middleware/authMiddleware.js"

const router = express.Router()

// router.use(verifyToken)

router.post("/", bookingController.createBooking)
router.get("/user", bookingController.getUserBookings)
router.get("/mitra", bookingController.getMitraBookings)
router.get("/unit/:unitId/schedule", bookingController.getUnitSchedule)
router.get("/:id", bookingController.getBookingById)
router.patch("/:id/status", bookingController.updateStatus)
router.post("/:bookingId/review", reviewController.createReview)

export default router
