export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, user } = useAuth()

  // Define public pages
  const publicPages = ['/', '/auth/login', '/auth/register', '/promos']
  // /mitra (list halaman publik) dan /mitra/:id (detail toko) boleh diakses tanpa login
  // tapi /mitra/dashboard dan sub-halamannya harus login dulu
  const isPublicPage =
    publicPages.includes(to.path) ||
    to.path === '/mitra' ||
    (to.path.startsWith('/mitra/') && !to.path.startsWith('/mitra/dashboard'))

  // 1. If not logged in and trying to access a restricted page
  if (!isLoggedIn.value && !isPublicPage) {
    return navigateTo('/auth/login')
  }

  // 2. If already logged in
  if (isLoggedIn.value) {
    // Prevent access to login/register pages
    if (to.path === '/auth/login' || to.path === '/auth/register') {
      if (user.value?.role === 'ADMIN') {
        return navigateTo('/admin/dashboard')
      } else if (user.value?.role === 'MITRA') {
        return navigateTo('/mitra/dashboard')
      } else {
        return navigateTo('/')
      }
    }

    // Role-based route protection for admin
    if (to.path.startsWith('/admin') && user.value?.role !== 'ADMIN') {
      return navigateTo('/')
    }

    // Role-based route protection for mitra dashboard
    if (to.path.startsWith('/mitra/dashboard') && user.value?.role !== 'MITRA') {
      return navigateTo('/')
    }

    // Role-based route protection for customer
    if (to.path.startsWith('/user') && user.value?.role !== 'CUSTOMER') {
      return navigateTo('/')
    }
  }
})
