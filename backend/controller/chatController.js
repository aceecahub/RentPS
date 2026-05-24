import { getOrCreateRoomService, getInboxService, saveMessageService } from "../service/chatService.js"

export const getChatRoomHistory = async (req, res) => {
    const { customerId, mitraId } = req.params
    try {
        const room = await getOrCreateRoomService(customerId, mitraId)
        return res.status(200).json({ success: true, data: room })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const getInbox = async (req, res) => {
    const { userId, role, mitraProfileId } = req.query

    try {
        const rooms = await getInboxService(userId, role, mitraProfileId)
        return res.status(200).json({ success: true, data: rooms })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const sendMessage = async (req, res) => {
    const { roomId, senderId, message } = req.body
    try {
        const savedMessage = await saveMessageService(roomId, senderId, message)
        return res.status(201).json({ success: true, data: savedMessage })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
