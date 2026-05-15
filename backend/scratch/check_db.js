import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function check() {
    const rooms = await prisma.chatRoom.count()
    const messages = await prisma.chatMessage.count()
    console.log(`Rooms: ${rooms}, Messages: ${messages}`)
    
    if (rooms > 0) {
        const lastRoom = await prisma.chatRoom.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        console.log('Last Room:', lastRoom)
    }
    
    if (messages > 0) {
        const lastMsg = await prisma.chatMessage.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        console.log('Last Message:', lastMsg)
    }
}

check().catch(console.error).finally(() => prisma.$disconnect())
