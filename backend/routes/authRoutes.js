import express from "express"
import { registerController, loginController } from "../controller/authController.js"
import authLimit from "../middleware/authLimit.js"

const router = express.Router()

router.post("/register", registerController)
router.post("/login", authLimit, loginController)

export default router
