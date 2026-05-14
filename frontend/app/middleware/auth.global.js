export default defineNuxtRouteMiddleware(async (to) => {
  const { $authClient } = useNuxtApp()
  
  // Await the session properly
  const { data: session } = await $authClient.getSession({
    fetchOptions: {
      headers: import.meta.server ? useRequestHeaders(['cookie', 'authorization']) : undefined
    }
  })

  // Store in global state for useAuth.js to use
  const authSession = useState('auth-session')
  authSession.value = session

  const isLoggedIn = !!session
  const user = session?.user

  // Define public pages
  const publicPages = ['/', '/auth/login', '/auth/register', '/promos', '/test-session']
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/mitra/') || to.path === '/mitra'

  // 1. If not logged in and trying to access a restricted page
  if (!isLoggedIn && !isPublicPage) {
    return navigateTo('/auth/login')
  }

  // 2. If already logged in
  if (isLoggedIn) {
    // Prevent access to login/register pages
    if (to.path === '/auth/login' || to.path === '/auth/register') {
      if (user?.role === 'ADMIN') {
        return navigateTo('/admin/dashboard')
      } else if (user?.role === 'MITRA') {
        return navigateTo('/mitra/dashboard')
      } else {
        return navigateTo('/')
      }
    }

    // Role-based route protection for admin
    if (to.path.startsWith('/admin') && user?.role !== 'ADMIN') {
      return navigateTo('/')
    }

    // Role-based route protection for mitra dashboard
    if (to.path.startsWith('/mitra/dashboard') && user?.role !== 'MITRA') {
      return navigateTo('/')
    }

    // Role-based route protection for customer
    if (to.path.startsWith('/user') && user?.role !== 'CUSTOMER') {
      return navigateTo('/')
    }
  }
})
