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
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
    <!-- Abstract Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full animate-pulse"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-navy/5 blur-[150px] rounded-full"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <div class="bg-white rounded-[48px] shadow-2xl shadow-navy/10 border border-gray-100 overflow-hidden transform transition-all hover:shadow-navy/20">
        <div class="p-10 md:p-14">
          <!-- Logo & Back Button -->
          <div class="flex flex-col items-center mb-12">
            <NuxtLink to="/" class="group inline-flex items-center space-x-2 text-gray-400 hover:text-navy transition-all mb-10 font-black text-[10px] uppercase tracking-[0.2em]">
              <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </NuxtLink>
            
            <div class="w-20 h-20 bg-navy rounded-[28px] flex items-center justify-center mb-6 shadow-xl shadow-navy/20 transform hover:rotate-12 transition-transform cursor-pointer">
              <Icon name="heroicons:bolt-20-solid" class="text-primary-400 w-10 h-10" />
            </div>
            <h2 class="text-4xl font-black text-navy tracking-tight">Welcome Back</h2>
            <p class="text-gray-400 font-medium mt-2">Masuk ke dashboard RentPS Anda</p>
          </div>

          <!-- Error Alert -->
          <Transition name="fade">
            <div v-if="errorMsg" class="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center font-bold">
              <Icon name="heroicons:exclamation-circle-20-solid" class="w-5 h-5 mr-3 shrink-0" />
              {{ errorMsg }}
            </div>
          </Transition>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-8">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div class="relative">
                <Icon name="heroicons:envelope-20-solid" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  v-model="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-14 pr-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner"
                  :disabled="isLoading"
                  required
                >
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center px-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                <a href="#" class="text-[10px] font-black text-primary-500 hover:text-navy uppercase tracking-widest transition-colors">Forgot?</a>
              </div>
              <div class="relative">
                <Icon name="heroicons:lock-closed-20-solid" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  v-model="password" 
                  type="password" 
                  placeholder="••••••••" 
                  class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-14 pr-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner"
                  :disabled="isLoading"
                  required
                >
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full bg-navy text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-navy/20 hover:bg-primary-500 hover:text-navy active:scale-[0.98] transition-all flex items-center justify-center group"
              :disabled="isLoading"
            >
              <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="w-6 h-6 mr-3" />
              <span v-else class="flex items-center">
                Log In
                <Icon name="heroicons:arrow-right-20-solid" class="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-12 text-center">
            <p class="text-gray-400 font-bold text-sm">
              Belum punya akun? 
              <NuxtLink to="/auth/register" class="text-navy font-black hover:text-primary-500 transition-colors ml-1 underline underline-offset-4 decoration-primary-500 decoration-2">Daftar Sekarang</NuxtLink>
            </p>
          </div>
        </div>
        
        <!-- Footer Info -->
        <div class="bg-gray-50/50 p-8 text-center border-t border-gray-100/50">
          <p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-relaxed">
            By logging in, you agree to our <br> <span class="text-gray-400">Terms of Service & Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>