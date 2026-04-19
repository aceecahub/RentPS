import prisma from "../prisma/client.js"


export const getAllPsService = async () => {
    return await prisma.playstationUnit.findMany()
}

export const getPsByIdService = async (id) => {
    return await prisma.playstationUnit.findUnique({
        where: { id: parseInt(id) }
    })
}

export const createPsService = async (data) => {
    const { mitraId, name, type, pricePerHour, isAvailable } = data

    return await prisma.playstationUnit.create({
        data: {
            mitraId,
            name,
            type,
            pricePerHour,
            isAvailable: true
        }
    })
}

export const updatePsService = async (id, data) => {
    const { name, type, pricePerHour, isAvailable } = data

    return await prisma.playstationUnit.update({
        where: { id: parseInt(id) },
        data: {
            name,
            type,
            pricePerHour,
            isAvailable
        }
    })
}

export const deletePsService = async (id) => {
    return await prisma.playstationUnit.delete({
        where: { id: parseInt(id) }
    })
}