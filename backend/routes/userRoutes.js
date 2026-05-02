import express from "express"
import { getAllUsers, getUserProfile, updateUserProfile } from "../controller/userController.js"

const router = express.Router()

router.get("/all", getAllUsers)
router.get("/profile/:userId", getUserProfile)
router.put("/profile/:userId", updateUserProfile)

export default router
