export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isLoggedIn } = useAuth()

  // 1. Jika belum login, arahkan ke login
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login')
  }

  // 2. Proteksi khusus untuk Mitra yang belum disetujui
  // Abaikan pengecekan ini jika user adalah CUSTOMER
  if (user.value?.role === 'MITRA' && user.value?.approvalStatus !== 'APPROVED') {
    // Izinkan tetap di dashboard utama untuk melihat status, 
    // tapi blokir jika mencoba akses sub-menu lain jika perlu
    if (to.path !== '/mitra/dashboard') {
      return navigateTo('/mitra/dashboard')
    }
  }
})
