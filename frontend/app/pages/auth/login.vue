<script setup>
const { login, user } = useAuth()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMsg.value = ''
  
  try {
    console.log('Attempting login for:', email.value)
    const result = await login(email.value, password.value)
    
    if (result.success) {
      console.log('Login successful, user role:', user.value?.role)
      // Gunakan window.location.href agar state kereload sempurna
      if (user.value?.role === 'ADMIN') {
        window.location.href = '/admin/dashboard'
      } else if (user.value?.role === 'MITRA') {
        window.location.href = '/mitra/dashboard'
      } else {
        window.location.href = '/'
      }
    } else {
      console.error('Login failed:', result.message)
      errorMsg.value = result.message
    }
  } catch (err) {
    console.error('Unexpected error during login:', err)
    errorMsg.value = err.response?._data?.message || err.message || 'Terjadi kesalahan sistem. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div class="p-10">
        <div class="text-center mb-10">
          <NuxtLink to="/" class="inline-flex items-center space-x-2 text-gray-400 hover:text-navy transition-colors mb-6 font-bold text-sm">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </NuxtLink>
          <div class="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-navy/20">
            <Icon name="heroicons:bolt-20-solid" class="text-white w-10 h-10" />
          </div>
          <h2 class="text-3xl font-black text-navy">Selamat Datang</h2>
          <p class="text-gray-500 mt-2">Masuk ke akun RentPS Anda</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center">
            <Icon name="heroicons:exclamation-circle" class="w-5 h-5 mr-2" />
            {{ errorMsg }}
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-navy ml-1">Email</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="nama@email.com" 
              class="input-field"
              :disabled="isLoading"
              required
            >
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between items-center px-1">
              <label class="text-sm font-bold text-navy">Password</label>
              <a href="#" class="text-xs font-bold text-primary-600 hover:underline">Lupa Password?</a>
            </div>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              class="input-field"
              :disabled="isLoading"
              required
            >
          </div>

          <button 
            type="submit" 
            class="w-full btn-primary py-4 text-lg shadow-xl shadow-navy/20 active:scale-95 transition-transform flex items-center justify-center"
            :disabled="isLoading"
          >
            <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="w-6 h-6 mr-2" />
            {{ isLoading ? 'Memproses...' : 'Log In' }}
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-500 text-sm">
            Belum punya akun? 
            <NuxtLink to="/auth/register" class="text-navy font-bold hover:underline">Daftar Sekarang</NuxtLink>
          </p>
        </div>
      </div>
      
      <div class="bg-gray-50 p-6 text-center border-t border-gray-100">
        <p class="text-xs text-gray-400">
          Dengan masuk, Anda menyetujui Syarat & Ketentuan kami.
        </p>
      </div>
    </div>
  </div>
</template>