import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { initSocket } from "./socket/socketHandler.js" 

// routes class
import authRoutes from "./routes/authRoutes.js"
import mitraRoutes from "./routes/mitraRoutes.js"
import psRoutes from "./routes/psRoutes.js"
import snackRoutes from "./routes/snackRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import chatbotRoutes from "./routes/chatbotRoutes.js"
import chatRoutes from "./routes/chatRoutes.js" 
import { startBookingCron } from "./service/bookingExpiryServices.js"

const app = express()

// Start Cron Jobs
startBookingCron()

// Trust proxy for express-rate-limit
app.set('trust proxy', 1)

app.get('/', (req, res) => {
    res.send('Hello express!')
})

const allowedOrigins = [
    "http://localhost:3000",
    "https://observing-unsliced-congrats.ngrok-free.dev"
]

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json())

// Integrasi Routing HTTP REST API
app.use("/api/auth", authRoutes)
app.use("/api/mitra", mitraRoutes)
app.use("/api/ps", psRoutes)
app.use("/api/snack", snackRoutes)
app.use("/api/booking", bookingRoutes)
app.use("/api/user", userRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/chatbot", chatbotRoutes)
app.use("/api/chat", chatRoutes)

// 6. BUAT HTTP SERVER DARI APP EXPRESS
const httpServer = createServer(app)

// 7. INITIALIZE SOCKET.IO WITH CORS CONFIG
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
})

// 8. HUBUNGKAN SOCKET HANDLER
initSocket(io)

// 9. JALANKAN MENGGUNAKAN httpServer (BUKAN app.listen)
httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
