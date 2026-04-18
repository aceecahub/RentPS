import express from 'express'
import dotenv from 'dotenv'
import cors from "cors"

// routes class
import authRoutes from "./routes/authRoutes.js"
import mitraRoutes from "./routes/mitraRoutes.js"
dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.send('Hello express!')
})

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

// mitra
app.use("/api/mitra", mitraRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})