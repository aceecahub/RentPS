import prisma from "./prisma/client.js";
import bcrypt from "bcrypt";

async function createAdmin() {
    try {
        const email = "admin@gmail.com";
        const password = "password";
        const name = "Administrator";
        const role = "ADMIN";

        // Cek apakah admin sudah ada
        const existingAdmin = await prisma.user.findUnique({
            where: { email }
        });

        if (existingAdmin) {
            console.log("Admin already exists with email:", email);
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role
            }
        });

        console.log("Admin created successfully:");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
