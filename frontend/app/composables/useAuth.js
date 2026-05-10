export const useAuth = () => {
  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
  const user = useCookie('auth_user', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })
  const config = useRuntimeConfig()

  const login = async (email, password) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password }
      })
      
      token.value = data.token
      user.value = data.user
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error.response?._data || error)
      return { 
        success: false, 
        message: error.response?._data?.message || 'Terjadi kesalahan sistem. Silakan coba lagi.' 
      }
    }
  }

  const register = async (formData) => {
    try {
      const endpoint = formData.role === 'MITRA' ? '/mitra/register' : '/auth/register'
      const data = await $fetch(`${config.public.apiBase}${endpoint}`, {
        method: 'POST',
        body: formData
      })
      return { success: true, message: data.message }
    } catch (error) {
      console.error('Registration error:', error.response?._data || error)
      return { 
        success: false, 
        message: error.response?._data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    
    // Clear cookies explicitly if needed, but nulling them usually works
    navigateTo('/auth/login')
  }

  return {
    token,
    user,
    login,
    register,
    logout,
    isLoggedIn: computed(() => !!token.value)
  }
}
