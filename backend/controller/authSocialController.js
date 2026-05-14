// controllers/authSocialController.js
import { googleExchangeService } from "../service/authSocialService.js";

export const googleCallbackController = async (req, res) => {
    try {
        // Kirim req.headers agar Better Auth bisa membaca cookies session dari browser/Postman
        const result = await googleExchangeService(req.headers);
        
        // Return user dan token JWT proyek final Anda ke frontend Nuxt
        return res.status(200).json({
            status: "success",
            message: "Login Gmail berhasil ditukarkan ke JWT final",
            data: result
        });
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: error.message
        });
    }
};
