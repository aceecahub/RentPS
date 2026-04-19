import prisma from "../prisma/client.js"


export const getAllSnackService = async () => {
    return await prisma.snack.findMany()
}

export const getSnackByIdService = async (id) => {
    return await prisma.snack.findUnique({
        where: { id: parseInt(id) }
    })
}

export const createSnackService = async (data) => {
    const { mitraId, name, price, stock } = data

    return await prisma.snack.create({
        data: {
            mitraId,
            name,
            price,
            stock,
        }
    })
}

export const updateSnackService = async (id, data) => {
    const { name, price, stock } = data

    return await prisma.snack.update({
        where: { id: parseInt(id) },
        data: {
            name,
            price,
            stock,
        }
    })
}

export const deleteSnackService = async (id) => {
    return await prisma.snack.delete({
        where: { id: parseInt(id) }
    })
}