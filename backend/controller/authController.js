import { registerService, loginService } from "../service/authService.js";

export const registerController = async (req, res) => {
    try {
        const user = await registerService(req.body)
        res.status(201).json({ message: "User berhasil terdaftar", user })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const loginController = async (req, res) => {
    try {
        const user = await loginService(req.body)
        res.status(201).json({ message: "User berhasil login", user })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}