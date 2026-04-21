import express from "express"
import { register, approveMitra, CloseAndOpen, OperatingHours } from "../controller/mitraController.js"

const router = express.Router()

router.post("/register", register)
router.put("/approve/:id", approveMitra)
router.put("/cando/:id", CloseAndOpen)
router.post("/operatinghours/:id", OperatingHours)

export default router