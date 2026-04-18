import express from 'express'
import dotenv from 'dotenv'
import authRoutes from "./routes/authRoutes.js"
import cors from "cors"
dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.send('Hello express!')
})

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})