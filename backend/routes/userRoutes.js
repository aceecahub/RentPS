import express from "express"
import { getAllUsers, getUserProfile, updateUserProfile, updateAvatar } from "../controller/userController.js"
import { uploadAvatar } from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.get("/all", getAllUsers)
router.get("/profile/:userId", getUserProfile)
router.put("/profile/:userId", updateUserProfile)
router.post("/avatar/:userId", uploadAvatar.single('avatar'), updateAvatar)

export default router

