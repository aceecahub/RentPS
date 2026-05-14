import express from "express"
import { registerController, loginController } from "../controller/authController.js"
import { googleCallbackController } from "../controller/authSocialController.js";
import authLimit from "../middleware/authLimit.js"

const router = express.Router()

router.post("/register", registerController)
router.post("/login", authLimit, loginController)
router.get("/google-jwt-exchange", googleCallbackController);

export default router
