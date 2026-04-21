import prisma from '../prisma/client.js'
import bcrypt from "bcrypt"

export const registerMitra = async (inputData) => {
    const { 
        email, password, name, 
        shopName, address, latitude, longitude,
        nik, npwp, identityPhoto, // Data untuk Approval
        photos // Array URL foto bangunan/ruangan PS
    } = inputData

    const hashedPassword = await bcrypt.hash(password, 10)

    return await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'MITRA',
            mitraProfile: {
                create: {
                    shopName,
                    address,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    nik,
                    npwp, // NPWP Opsional di schema kamu
                    identityPhoto, // Foto KTP
                    approvalStatus: 'PENDING',
                    // Relasi ke tabel MitraPhoto (Foto-foto tempat usaha)
                    photos: {
                        create: photos && photos.length > 0 ? photos.map((url, index) => ({
                            photoUrl: url,
                            isMain: index === 0, // Foto pertama otomatis jadi foto utama
                            caption: `Foto Ruangan ${index + 1}`
                        })) : []
                    }
                }
            }
        },
        include: {
            mitraProfile: {
                include: {
                    photos: true
                }
            }
        }
    })
}


export const updateApprovalStatus = async (mitraId, approvalStatus, rejectionReason = null) => {
    return await prisma.mitraProfile.update({
        where: { id: parseInt(mitraId) },
        data: { 
            approvalStatus: approvalStatus,
            rejectionReason: rejectionReason 
        },
    })
}


export const manualCloseAndOpen = async (mitraId, isManualClosed, manualCloseReason = null) => {
    return await prisma.mitraProfile.update({
        where: { id: parseInt(mitraId) },
        data: { 
            isManualClosed: isManualClosed,
            manualCloseReason: manualCloseReason 
        },
    })
}

export const operatingHours = async (mitraId, day, openTime, closeTime, isOpen) => {
    return await prisma.operatingHour.create({
        data: {
            mitraId: parseInt(mitraId),
            day: day,
            openTime: openTime,
            closeTime: closeTime,
            isOpen: isOpen
        }
    })
}