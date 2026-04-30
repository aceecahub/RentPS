export const useAuth = () => {
  const token = useState('auth_token', () => null)
  const user = useState('auth_user', () => null)
  const config = useRuntimeConfig()

  // Immediate initialization on client side
  if (process.client) {
    const initAuth = () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      
      if (storedToken && !token.value) {
        token.value = storedToken
      }
      
      if (storedUser && !user.value) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          localStorage.removeItem('auth_user')
        }
      }
    }
    initAuth()
  }

  const login = async (email, password) => {
    try {
      const data = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password }
      })
      
      token.value = data.token
      user.value = data.user
      
      if (process.client) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      }
      
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
    
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    
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
