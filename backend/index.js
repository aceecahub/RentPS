import express from 'express'
import dotenv from 'dotenv'
import cors from "cors"

// routes class
import authRoutes from "./routes/authRoutes.js"
import mitraRoutes from "./routes/mitraRoutes.js"
import psRoutes from "./routes/psRoutes.js"
import snackRoutes from "./routes/snackRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import userRoutes from "./routes/userRoutes.js"
dotenv.config()

const app = express()

// Trust proxy for express-rate-limit
app.set('trust proxy', 1)

app.get('/', (req, res) => {
    res.send('Hello express!')
})

app.use(cors())
app.use(express.json())

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

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})