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
        const { user, token } = await loginService(req.body)
        res.status(200).json({ 
            message: "User berhasil login", 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}