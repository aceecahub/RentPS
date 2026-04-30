import express from "express"
import { getUserProfile, updateUserProfile } from "../controller/userController.js"

const router = express.Router()

router.get("/profile/:userId", getUserProfile)
router.put("/profile/:userId", updateUserProfile)

export default router
