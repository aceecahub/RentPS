import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from "cors"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./config/auth.js"

// routes class
import authRoutes from "./routes/authRoutes.js"
import mitraRoutes from "./routes/mitraRoutes.js"
import psRoutes from "./routes/psRoutes.js"
import snackRoutes from "./routes/snackRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import { startBookingCron } from "./service/bookingExpiryServices.js"

const app = express()

// Start Cron Jobs
startBookingCron()

// Trust proxy for express-rate-limit
app.set('trust proxy', 1)

app.get('/', (req, res) => {
    res.send('Hello express!')
})

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://observing-unsliced-congrats.ngrok-free.dev"],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/auth", toNodeHandler(auth));

// auth
app.use("/api/auth", authRoutes)
// mitra
app.use("/api/mitra", mitraRoutes)
// ps
app.use("/api/ps", psRoutes)
// snack
app.use("/api/snack", snackRoutes)
// booking
app.use("/api/booking", bookingRoutes)
// user
app.use("/api/user", userRoutes)
// payment
app.use("/api/payment", paymentRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})