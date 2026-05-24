import express from "express"
import { getChatRoomHistory, getInbox, sendMessage } from "../controller/chatController.js"

const router = express.Router()

// Endpoint: GET /api/chat/room/:customerId/:mitraId
router.get("/room/:customerId/:mitraId", getChatRoomHistory)

// Endpoint: GET /api/chat/inbox
router.get("/inbox", getInbox)

// Endpoint: POST /api/chat/message
router.post("/message", sendMessage)

export default router
