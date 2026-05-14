import { computed, ref } from "vue"

export const useAuth = () => {
  const { $authClient } = useNuxtApp()
  const { signIn, signUp, signOut } = $authClient
  
  // Use globally fetched session from middleware
  const session = useState('auth-session', () => null)
  const isPending = ref(false) // No longer pending since middleware awaits it
  const error = ref(null)
  
  const user = computed(() => session.value?.user)
  const isLoggedIn = computed(() => !!session.value)

  const login = async (email, password) => {
    try {
      const { data, error } = await signIn.email({
        email,
        password,
      })

      if (error) {
        return { 
          success: false, 
          message: error.message || 'Login gagal. Periksa kembali email dan password Anda.' 
        }
      }

      return { success: true, data }
    } catch (err) {
      console.error('Login error:', err)
      return { 
        success: false, 
        message: 'Terjadi kesalahan sistem. Silakan coba lagi.' 
      }
    }
  }

  const loginWithGoogle = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/"
      })
    } catch (err) {
      console.error('Google login error:', err)
    }
  }

  const register = async (formData) => {
    try {
      const { data, error } = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role, // Pass the role to Better Auth!
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, data, message: 'Registrasi berhasil!' }
    } catch (err) {
      console.error('Registration error:', err)
      return { 
        success: false, 
        message: 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    await signOut()
    session.value = null
    navigateTo('/auth/login')
  }

  return {
    session,
    user,
    isPending,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    isLoggedIn
  }
}

