import rateLimit from "express-rate-limit";

const authLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Terlalu banyak percobaan login, coba lagi dalam 1 menit"
})

export default authLimit