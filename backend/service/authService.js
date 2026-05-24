import prisma from "../prisma/client.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const registerService = async (data) => {
    const { email, password, name, role } = data;

    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        throw new Error("Email sudah digunakan")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role
        }
    })

    return user;
}

export const loginService =  async (data) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        throw new Error("Email atau Password salah!")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Email atau Password salah!")
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })

    return { user, token }
}