import prisma from "../prisma/client.js";

class ChatbotService {
    
    async getWelcomeMessage() {
        return "Halo! Selamat datang di Layanan Sewa PS Tasikmalaya. Ada yang bisa dibantu?";
    }
    
    async getHelpMessage() {
        return "Berikut adalah beberapa hal yang bisa Anda lakukan:\n" +
               "- Cari PS [nama daerah]\n" +
               "- Cari PS [tipe] di [daerah] (Contoh: rental PS 4 di Cihideung)\n" +
               "- Harga termurah di [daerah]\n" +
               "- Cek status buka/tutup di [daerah]\n" +
               "- Rekomendasi mitra rating terbaik di [daerah]\n" +
               "Ada yang bisa dibantu?";
    }
    
    async getGreetingMessage() {
        return "Halo! Senang bertemu dengan Anda. Ada yang bisa dibantu?";
    }
    
    async getFallbackMessage() {
        return "Maaf, saya tidak mengerti maksud Anda. Ketik 'bantuan' untuk melihat menu layanan.";
    }

    // 1. Fungsi Pencarian Mitra Umum
    async cariMitraRental(lokasi) {
        const mitras = await prisma.mitraProfile.findMany({
            where: {
                approvalStatus: 'APPROVED',
                isManualClosed: false,
                ...(lokasi ? {
                    OR: [
                        { address: { contains: lokasi } },
                        { shopName: { contains: lokasi } }
                    ]
                } : {})
            },
            include: {
                units: {
                    where: { isAvailable: true },
                    select: { type: true, pricePerHour: true }
                }
            },
            take: 3
        });

        if (mitras.length === 0) {
            return `Maaf, saat ini belum ada mitra rental PS kami yang aktif di daerah "${lokasi}".`;
        }

        let teksHasil = `🎮 *Rekomendasi Rental PS di dekat "${lokasi}":* \n\n`;
        mitras.forEach((mitra, index) => {
            const daftarTipe = mitra.units.map(u => u.type);
            const tipeTersedia = daftarTipe.length > 0 ? [...new Set(daftarTipe)].join(', ') : 'Unit penuh';
            const hargaMin = mitra.units.length > 0 ? Math.min(...mitra.units.map(u => Number(u.pricePerHour))) : 0;

            teksHasil += `${index + 1}️⃣ *${mitra.shopName}*\n`;
            teksHasil += `📍 Alamat: ${mitra.address}\n`;
            teksHasil += `🕹️ Unit: [${tipeTersedia}]\n`;
            teksHasil += `💰 Sewa: Rp ${hargaMin.toLocaleString('id-ID')}/jam\n\n`;
        });

        return teksHasil;
    }

    // 2. Fungsi Pencarian PS Spesifik (PS 2, PS 3, PS 4, PS 5)
    async cariPSSpesifik(tipe, lokasi) {
        const mitras = await prisma.mitraProfile.findMany({
            where: {
                approvalStatus: 'APPROVED',
                isManualClosed: false,
                ...(lokasi ? {
                    OR: [
                        { address: { contains: lokasi } },
                        { shopName: { contains: lokasi } }
                    ]
                } : {}),
                units: {
                    some: {
                        type: { contains: tipe },
                        isAvailable: true
                    }
                }
            },
            include: {
                units: {
                    where: { type: { contains: tipe }, isAvailable: true },
                    select: { type: true, pricePerHour: true }
                }
            },
            take: 3
        });

        if (mitras.length === 0) {
            return `Maaf, belum ada mitra yang menyediakan ${tipe} ${lokasi ? `di daerah "${lokasi}"` : 'saat ini'}.`;
        }

        let teksHasil = `🎮 *Penyewaan ${tipe} ${lokasi ? `di dekat "${lokasi}"` : ''}:* \n\n`;
        mitras.forEach((mitra, index) => {
            const unitSpesifik = mitra.units[0];
            const harga = unitSpesifik ? Number(unitSpesifik.pricePerHour) : 0;
            teksHasil += `${index + 1}️⃣ *${mitra.shopName}*\n`;
            teksHasil += `📍 Alamat: ${mitra.address}\n`;
            teksHasil += `💰 Harga ${tipe}: Rp ${harga.toLocaleString('id-ID')}/jam\n\n`;
        });

        return teksHasil;
    }

    // 3. Fungsi Cari PS Termurah
    async cariPSTermurah(lokasi) {
        const mitras = await prisma.mitraProfile.findMany({
            where: {
                approvalStatus: 'APPROVED',
                isManualClosed: false,
                ...(lokasi ? {
                    OR: [
                        { address: { contains: lokasi } },
                        { shopName: { contains: lokasi } }
                    ]
                } : {})
            },
            include: {
                units: {
                    where: { isAvailable: true },
                    select: { type: true, pricePerHour: true }
                }
            }
        });

        if (mitras.length === 0) {
            return `Maaf, tidak ditemukan mitra aktif ${lokasi ? `di daerah "${lokasi}"` : ''}.`;
        }

        let termurah = [];
        mitras.forEach(mitra => {
            if (mitra.units.length > 0) {
                const minPrice = Math.min(...mitra.units.map(u => Number(u.pricePerHour)));
                termurah.push({ ...mitra, minPrice });
            }
        });
        
        if (termurah.length === 0) return `Semua unit di ${lokasi || 'daerah ini'} sedang penuh/tidak tersedia.`;

        termurah.sort((a, b) => a.minPrice - b.minPrice);
        const topTermurah = termurah.slice(0, 3);

        let teksHasil = `💸 *Rekomendasi Harga PS Termurah ${lokasi ? `di "${lokasi}"` : ''}:* \n\n`;
        topTermurah.forEach((mitra, index) => {
            teksHasil += `${index + 1}️⃣ *${mitra.shopName}*\n`;
            teksHasil += `📍 Alamat: ${mitra.address}\n`;
            teksHasil += `💰 Mulai dari: *Rp ${mitra.minPrice.toLocaleString('id-ID')}/jam*\n\n`;
        });

        return teksHasil;
    }

    // 4. Cek Status Buka/Tutup
    async cekStatusMitra(lokasi) {
        if (!lokasi) return "Mohon sebutkan daerahnya untuk mengecek status buka/tutup mitra. (Contoh: status buka di Cihideung)";

        const mitras = await prisma.mitraProfile.findMany({
            where: {
                approvalStatus: 'APPROVED',
                OR: [
                    { address: { contains: lokasi } },
                    { shopName: { contains: lokasi } }
                ]
            },
            select: {
                shopName: true,
                address: true,
                isManualClosed: true,
                manualCloseReason: true
            }
        });

        if (mitras.length === 0) {
            return `Tidak ditemukan mitra di daerah "${lokasi}".`;
        }

        let teksHasil = `🏪 *Status Mitra di "${lokasi}":* \n\n`;
        mitras.forEach((mitra, index) => {
            const status = mitra.isManualClosed ? `🔴 TUTUP (${mitra.manualCloseReason || 'Sedang tutup manual'})` : `🟢 BUKA`;
            teksHasil += `${index + 1}️⃣ *${mitra.shopName}* - ${status}\n`;
        });

        return teksHasil;
    }

    // 5. Rekomendasi berdasarkan Rating
    async rekomendasiMitraRating(lokasi) {
        const mitras = await prisma.mitraProfile.findMany({
            where: {
                approvalStatus: 'APPROVED',
                isManualClosed: false,
                ...(lokasi ? {
                    OR: [
                        { address: { contains: lokasi } },
                        { shopName: { contains: lokasi } }
                    ]
                } : {})
            },
            include: {
                reviews: {
                    select: { rating: true }
                }
            }
        });

        if (mitras.length === 0) {
            return `Maaf, tidak ditemukan mitra aktif ${lokasi ? `di daerah "${lokasi}"` : ''}.`;
        }

        let denganRating = mitras.map(mitra => {
            let avgRating = 0;
            if (mitra.reviews.length > 0) {
                const total = mitra.reviews.reduce((sum, r) => sum + r.rating, 0);
                avgRating = total / mitra.reviews.length;
            }
            return { ...mitra, avgRating, totalReviews: mitra.reviews.length };
        });

        denganRating.sort((a, b) => b.avgRating - a.avgRating);
        const topRated = denganRating.slice(0, 3);

        let teksHasil = `⭐ *Rekomendasi Mitra Terbaik (Rating Tertinggi) ${lokasi ? `di "${lokasi}"` : ''}:* \n\n`;
        topRated.forEach((mitra, index) => {
            const ratingDisplay = mitra.avgRating > 0 ? `${mitra.avgRating.toFixed(1)}/5.0 (${mitra.totalReviews} ulasan)` : "Belum ada ulasan";
            teksHasil += `${index + 1}️⃣ *${mitra.shopName}*\n`;
            teksHasil += `⭐ Rating: ${ratingDisplay}\n`;
            teksHasil += `📍 Alamat: ${mitra.address}\n\n`;
        });

        return teksHasil;
    }

    extractLokasi(message, keywordsToRemove) {
        let text = message;
        keywordsToRemove.forEach(kw => {
            text = text.replace(new RegExp(`\\b${kw}\\b`, 'g'), '');
        });
        // Remove special characters that might be left over, except letters and numbers
        text = text.replace(/[^a-zA-Z0-9 ]/g, '');
        return text.replace(/\s+/g, ' ').trim();
    }

    async getResponse(userMessage) {
        const message = userMessage.toLowerCase().trim();
        
        if (message.includes("halo") || message.includes("hai")) {
            return this.getWelcomeMessage();
        } else if (message.includes("bantuan") || message.includes("bantu") || message === "menu") {
            return this.getHelpMessage();
        } else if (message.includes("selamat datang")) {
            return this.getGreetingMessage();
        } else if (message.includes("terima kasih") || message.includes("nuhun") || message.includes("thanks")) {
            return "Sama-sama! Ada lagi yang bisa dibantu?";
        } 
        
        // 1. Cek Status Buka/Tutup
        if (message.includes("tutup") || message.includes("buka") || message.includes("status")) {
            const kw = ["liat", "lihat", "mitra", "mana", "yang", "tutup", "dan", "buka", "setiap", "di", "daerah", "status", "cek"];
            const lokasi = this.extractLokasi(message, kw);
            return await this.cekStatusMitra(lokasi);
        }

        // 2. Cari PS Termurah
        if (message.includes("termurah") || message.includes("murah") || message.includes("harga")) {
            const kw = ["rekomendasi", "harga", "ps", "termurah", "paling", "murah", "di", "suatu", "daerah", "sekitar", "cari", "rental", "sewa"];
            const lokasi = this.extractLokasi(message, kw);
            return await this.cariPSTermurah(lokasi);
        }

        // 3. Rekomendasi berdasarkan rating
        if (message.includes("rating") || message.includes("terbaik")) {
            const kw = ["rekomendasi", "mitra", "sesuai", "rating", "terbaik", "di", "daerah", "sekitar", "cari", "rental", "sewa", "ps"];
            const lokasi = this.extractLokasi(message, kw);
            return await this.rekomendasiMitraRating(lokasi);
        }

        // 4. Cari tipe PS Spesifik (PS 2, PS 3, PS 4, PS 5)
        const psTypeMatch = message.match(/ps\s*([2345])/i);
        if (psTypeMatch) {
            const tipePS = `PS${psTypeMatch[1]}`;
            // Remove the match "ps 3" or "ps3" from string to extract location
            const msgWithoutPs = message.replace(new RegExp(`ps\\s*${psTypeMatch[1]}`, 'g'), '');
            const kw = ["rantal", "rental", "sewa", "sekitar", "nama", "daerah", "di", "cari", "ada", "yang"];
            const lokasi = this.extractLokasi(msgWithoutPs, kw);
            return await this.cariPSSpesifik(tipePS, lokasi);
        }

        // 5. Pencarian Umum
        if (message.includes("cari ps") || message.includes("rental di") || message.includes("daerah") || message.includes("rental ps")) {
            const kw = ["cari", "ps", "rental", "sewa", "di", "daerah", "sekitar", "nama"];
            const lokasi = this.extractLokasi(message, kw);
            
            if (!lokasi) {
                return "Mohon sertakan nama daerahnya. Contoh: 'Cari PS Cihideung' atau 'Cari PS Indihiang'.";
            }
            
            return await this.cariMitraRental(lokasi);
        } 
        
        return this.getFallbackMessage();
    }
    
    // (Optional) Dummy functions for Prisma message logging if needed later
    async saveMessage(userId, message) {
        // If Message table does not exist, we just skip it or log it
        // console.log(`User ${userId} message: ${message}`);
        return null;
    }
    
    async getMessages(userId) {
        return [];
    }
}

export default new ChatbotService();
