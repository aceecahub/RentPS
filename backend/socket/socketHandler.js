import { saveMessageService } from "../service/chatService.js"

export const initSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`[Socket] User terhubung: ${socket.id}`)

        socket.on("disconnect", (reason) => {
            console.log(`[Socket] User terputus (${socket.id}): ${reason}`)
        })

        // Event saat user/mitra masuk ke dalam kamar chat tertentu
        socket.on("join_room", (roomId) => {
            const roomName = `room_${String(roomId)}`
            socket.join(roomName)
            console.log(`[Socket] Socket ${socket.id} masuk ke kamar: ${roomName}`)
        })

        // Event saat menerima pesan baru dari sisi client Nuxt
        socket.on("send_message", async (data) => {
            console.log("[Socket] Menerima pesan:", data)
            
            // Jika data sudah berisi pesan lengkap (dari REST API), langsung broadcast
            if (data.id && data.message) {
                const roomName = `room_${String(data.roomId)}`
                io.to(roomName).emit("receive_message", data)
                console.log(`[Socket] Pesan (pre-saved) di-broadcast ke ${roomName}`)
                return
            }

            const { roomId, senderId, message } = data
            try {
                // Panggil service untuk simpan ke database MySQL via Prisma
                const savedMessage = await saveMessageService(roomId, senderId, message)
                console.log("[Socket] Pesan tersimpan:", savedMessage.id)

                // Broadcast pesan yang sudah tersimpan ke semua user di dalam kamar tersebut
                const roomName = `room_${String(roomId)}`
                io.to(roomName).emit("receive_message", savedMessage)
                console.log(`[Socket] Pesan di-broadcast ke ${roomName}`)
            } catch (error) {
                console.error("[Socket Error] Gagal memproses pesan:", error)
            }
        })

        socket.on("disconnect", () => {
            console.log(`[Socket] User terputus: ${socket.id}`)
        })
    })
}
