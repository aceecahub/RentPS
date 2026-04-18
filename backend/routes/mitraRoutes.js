import express from "express"
import { register, approveMitra } from "../controller/mitraController.js"

const router = express.Router()

router.post("/register", register)
router.put("/approve/:id", approveMitra)

export default router