import express from "express"
import { setupProfile, approveMitra, CloseAndOpen, OperatingHours, getAllMitra, getMitraById, getDashboardStats, getAdminStats, getMitrasByStatus, addPhoto, deletePhoto, updateProfile, getIncomeReportController } from "../controller/mitraController.js"
import { uploadMitraPhoto } from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.get("/", getAllMitra)
router.get("/stats", getDashboardStats)
router.get("/income/:id", getIncomeReportController)
router.get("/admin/stats", getAdminStats)
router.get("/admin/list", getMitrasByStatus)
router.get("/:id", getMitraById)
router.post("/setup-profile", setupProfile)
router.put("/profile/:id", updateProfile)
router.put("/approve/:id", approveMitra)
router.put("/cando/:id", CloseAndOpen)
router.post("/operatinghours/:id", OperatingHours)
router.post("/photo/:id", uploadMitraPhoto.single('photo'), addPhoto)
router.delete("/photo/:photoId", deletePhoto)

export default router