import express from "express"
import { register, approveMitra, CloseAndOpen, OperatingHours, getAllMitra, getMitraById, getDashboardStats, getAdminStats, getMitrasByStatus, addPhoto, deletePhoto, updateProfile } from "../controller/mitraController.js"
import { uploadMitraPhoto } from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.get("/", getAllMitra)
router.get("/stats", getDashboardStats)
router.get("/admin/stats", getAdminStats)
router.get("/admin/list", getMitrasByStatus)
router.get("/:id", getMitraById)
router.post("/register", register)
router.put("/profile/:id", updateProfile)
router.put("/approve/:id", approveMitra)
router.put("/cando/:id", CloseAndOpen)
router.post("/operatinghours/:id", OperatingHours)
router.post("/photo/:id", uploadMitraPhoto.single('photo'), addPhoto)
router.delete("/photo/:photoId", deletePhoto)

export default router