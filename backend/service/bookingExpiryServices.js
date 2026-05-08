import prisma from "../prisma/client.js"
import cron from "node-cron"

export const startBookingCron = () => {
    // Jalankan setiap menit
    cron.schedule("* * * * *", async () => {
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        try {
            console.log(`[Cron] Running status update check at ${now.toISOString()}`)

            // 1. WAITING_PAYMENT -> CANCELLED (jika > 1 hari)
            const expiredBookings = await prisma.booking.updateMany({
                where: {
                    status: "WAITING_PAYMENT",
                    createdAt: {
                        lt: oneDayAgo
                    }
                },
                data: {
                    status: "CANCELLED"
                }
            })
            if (expiredBookings.count > 0) console.log(`[Cron] Cancelled ${expiredBookings.count} expired bookings`)

            // 2. CONFIRMED -> ONGOING (jika startTime <= now)
            const ongoingBookings = await prisma.booking.updateMany({
                where: {
                    status: "CONFIRMED",
                    startTime: {
                        lte: now
                    }
                },
                data: {
                    status: "ONGOING"
                }
            })
            if (ongoingBookings.count > 0) console.log(`[Cron] Started ${ongoingBookings.count} bookings to ONGOING`)

            // 3. ONGOING -> COMPLETED (jika endTime <= now)
            const completedBookings = await prisma.booking.updateMany({
                where: {
                    status: "ONGOING",
                    endTime: {
                        lte: now
                    }
                },
                data: {
                    status: "COMPLETED"
                }
            })
            if (completedBookings.count > 0) console.log(`[Cron] Completed ${completedBookings.count} bookings`)

        } catch (error) {
            console.error("[Cron] Error updating booking statuses:", error)
        }
    })
}
