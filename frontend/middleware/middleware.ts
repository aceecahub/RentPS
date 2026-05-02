// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isLoggedIn } = useUserSession()

  // 1. Cek apakah sudah login
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login')
  }

  // 2. Cek apakah statusnya APPROVED
  // Pastikan field 'approval_status' ada di data user Anda
  if (user.value?.approvalStatus !== 'APPROVED') {
    // Jika belum disetujui, arahkan ke halaman "Menunggu Verifikasi" atau Home
    return navigateTo('/pending-approval')
  }
})
