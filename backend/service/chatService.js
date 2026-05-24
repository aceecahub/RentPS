import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const getOrCreateRoomService = async (customerId, mitraId) => {
    // Cari room yang sudah ada
    let room = await prisma.chatRoom.findUnique({
        where: {
            customerId_mitraId: {
                customerId: Number(customerId),
                mitraId: Number(mitraId)
            }
        },
        include: {
            customer: {
                select: { id: true, name: true, userProfile: { select: { avatarUrl: true } } }
            },
            mitra: {
                select: { id: true, shopName: true, photos: { where: { isMain: true }, take: 1, select: { photoUrl: true } } }
            },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: { sender: { select: { name: true, role: true } } }
            }
        }
    })

    // Jika belum ada, buat room baru
    if (!room) {
        room = await prisma.chatRoom.create({
            data: {
                customerId: Number(customerId),
                mitraId: Number(mitraId)
            },
            include: {
                customer: {
                    select: { id: true, name: true, userProfile: { select: { avatarUrl: true } } }
                },
                mitra: {
                    select: { id: true, shopName: true, photos: { where: { isMain: true }, take: 1, select: { photoUrl: true } } }
                },
                messages: true
            }
        })
    }
    return room
}

export const saveMessageService = async (roomId, senderId, message) => {
    const newMessage = await prisma.chatMessage.create({
        data: {
            roomId: Number(roomId),
            senderId: Number(senderId),
            message: message
        },
        include: {
            sender: { select: { name: true, role: true } }
        }
    })

    // Update room's updatedAt so it appears at the top of inbox
    await prisma.chatRoom.update({
        where: { id: Number(roomId) },
        data: { updatedAt: new Date() }
    })

    return newMessage
}

export const getInboxService = async (userId, role, mitraProfileId) => {
    let whereClause = {};
    if (role === 'CUSTOMER') {
        whereClause = { customerId: Number(userId) };
    } else if (role === 'MITRA') {
        whereClause = { mitraId: Number(mitraProfileId) };
    } else {
        throw new Error('Invalid role');
    }

    const rooms = await prisma.chatRoom.findMany({
        where: whereClause,
        include: {
            customer: {
                select: { id: true, name: true, userProfile: { select: { avatarUrl: true } } }
            },
            mitra: {
                select: { id: true, shopName: true, photos: { where: { isMain: true }, take: 1, select: { photoUrl: true } } }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return rooms;
}
