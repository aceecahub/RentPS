// services/authSocialService.js
import prisma from "../prisma/client.js";
import jwt from "jsonwebtoken";
import { auth } from "../config/auth.js"; // Import instance betterAuth backend Anda

export const googleExchangeService = async (reqHeaders) => {
    // 1. Ambil sesi Better Auth dari request headers client
    const session = await auth.api.getSession({
        headers: reqHeaders
    });

    // 2. Validasi jika sesi tidak ditemukan
    if (!session || !session.user) {
        throw new Error("Sesi Google tidak valid atau telah kedaluwarsa!");
    }

    const googleUser = session.user;

    // 3. Cari user di tabel database berdasarkan email Gmail-nya
    let user = await prisma.user.findUnique({
        where: { email: googleUser.email }
    });

    // 4. Jika user belum ada di DB (Pengguna Baru dari Gmail), daftarkan otomatis sebagai CUSTOMER
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: googleUser.id, // Gunakan ID dari Google atau biarkan auto-generate prisma kustom Anda
                email: googleUser.email,
                name: googleUser.name,
                role: "CUSTOMER", // Otomatis diset menjadi CUSTOMER sesuai permintaan Anda
                password: "" // Kosongkan password karena login menggunakan Google Auth
            }
        });
    }

    // 5. Generate token JWT lama Anda (Format disamakan persis dengan loginService bawaan Anda)
    const token = jwt.sign(
        { id: user.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h" }
    );

    return { user, token };
};
