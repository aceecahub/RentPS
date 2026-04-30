import rateLimit from "express-rate-limit";

const authLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    validate: { xForwardedForHeader: false },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Terlalu banyak percobaan login, coba lagi dalam 1 menit"
        })
    }
})

export default authLimit