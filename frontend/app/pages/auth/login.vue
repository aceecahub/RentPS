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
      if (user.value?.role === 'ADMIN') {
        return navigateTo('/admin/dashboard')
      } else if (user.value?.role === 'MITRA') {
        return navigateTo('/mitra/dashboard')
      } else {
        return navigateTo('/')
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
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50/50">
    <!-- Abstract Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-primary-500/5 blur-[100px] rounded-full"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-navy/5 blur-[120px] rounded-full"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <div class="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200/60">
        <div class="p-8 md:p-10">
          <!-- Logo & Back Button -->
          <div class="flex flex-col items-center mb-8">
            <NuxtLink to="/" class="group inline-flex items-center space-x-1.5 text-slate-500 hover:text-navy transition-all mb-8 font-bold text-xs uppercase tracking-wider">
              <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Beranda</span>
            </NuxtLink>
            
            <div class="w-16 h-16 bg-navy rounded-xl flex items-center justify-center mb-4 shadow-md cursor-pointer">
              <Icon name="heroicons:bolt-20-solid" class="text-primary-400 w-8 h-8" />
            </div>
            <h2 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Selamat Datang</h2>
            <p class="text-slate-500 text-sm font-medium mt-1">Masuk ke dashboard RentPS Anda</p>
          </div>

          <!-- Error Alert -->
          <Transition name="fade">
            <div v-if="errorMsg" class="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center font-bold">
              <Icon name="heroicons:exclamation-circle-20-solid" class="w-4 h-4 mr-2 shrink-0" />
              {{ errorMsg }}
            </div>
          </Transition>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
              <div class="relative">
                <Icon name="heroicons:envelope-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  v-model="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  :disabled="isLoading"
                  required
                >
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center px-0.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <a href="#" class="text-xs font-bold text-primary-600 hover:text-navy uppercase tracking-wider transition-colors">Lupa?</a>
              </div>
              <div class="relative">
                <Icon name="heroicons:lock-closed-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  v-model="password" 
                  type="password" 
                  placeholder="••••••••" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  :disabled="isLoading"
                  required
                >
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full bg-navy hover:bg-primary-600 text-white py-3 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
              :disabled="isLoading"
            >
              <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="w-4 h-4" />
              <span v-else class="flex items-center gap-1.5">
                Log In
                <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
              </span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-8 text-center">
            <p class="text-slate-500 font-medium text-sm">
              Belum punya akun? 
              <NuxtLink to="/auth/register" class="text-navy font-bold hover:text-primary-600 transition-colors ml-1 underline underline-offset-4 decoration-primary-500 decoration-2">Daftar Sekarang</NuxtLink>
            </p>
          </div>
        </div>
        
        <!-- Footer Info -->
        <div class="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
            Dengan masuk, Anda menyetujui <br> <span class="text-slate-500">Ketentuan Layanan & Kebijakan Privasi kami</span>
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

html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>