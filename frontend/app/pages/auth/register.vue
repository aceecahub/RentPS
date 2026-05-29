<script setup>
const { register } = useAuth()
const role = ref('CUSTOMER')
const currentStep = ref(1)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  // Mitra Profile Fields
  shopName: '',
  address: '',
  nik: '',
  identityPhoto: 'https://via.placeholder.com/400x300?text=KTP+Photo', // Placeholder for now
  photos: [] // Optional
})

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!form.name || !form.email || !form.password) {
      errorMsg.value = 'Silakan isi semua bidang akun.'
      return
    }
    if (role.value === 'CUSTOMER') {
      handleRegister()
    } else {
      currentStep.value = 2
      errorMsg.value = ''
    }
  }
}

const prevStep = () => {
  currentStep.value = 1
}

const handleRegister = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  const result = await register({
    ...form,
    role: role.value
  })
  
  if (result.success) {
    successMsg.value = result.message + '. Silakan login.'
    setTimeout(() => navigateTo('/auth/login'), 2000)
  } else {
    errorMsg.value = result.message
  }
  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 flex items-center justify-center px-4 py-12">
    <div class="max-w-4xl w-full bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row">
      
      <!-- Left Side: Progress & Info -->
      <div class="md:w-1/3 bg-navy p-8 md:p-10 text-white flex flex-col justify-between">
        <div>
          <NuxtLink to="/" class="flex items-center space-x-1.5 mb-10 group text-slate-400 hover:text-white transition-colors">
            <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            <span class="text-sm font-bold">Beranda</span>
          </NuxtLink>
          
          <h2 class="text-2xl lg:text-3xl font-black mb-8 leading-tight">Daftar Akun</h2>
          
          <!-- Stepper UI -->
          <div class="space-y-6">
            <div class="flex items-center space-x-3">
              <div 
                class="w-9 h-9 rounded-lg flex items-center justify-center font-bold border-2 transition-all text-sm"
                :class="currentStep >= 1 ? 'bg-white text-navy border-white' : 'border-white/20 text-white/40'"
              >
                1
              </div>
              <div>
                <p class="text-sm font-bold">Informasi Akun</p>
                <p class="text-xs text-white/50">Email & Password</p>
              </div>
            </div>
            
            <div v-if="role === 'MITRA'" class="flex items-center space-x-3">
              <div 
                class="w-9 h-9 rounded-lg flex items-center justify-center font-bold border-2 transition-all text-sm"
                :class="currentStep === 2 ? 'bg-white text-navy border-white' : 'border-white/20 text-white/40'"
              >
                2
              </div>
              <div>
                <p class="text-sm font-bold">Detail Bisnis</p>
                <p class="text-xs text-white/50">Profil Mitra PS</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-16 pt-8 border-t border-white/10">
          <p class="text-xs text-slate-400 leading-relaxed">
            Daftar sekarang untuk mulai menyewa atau kembangkan bisnis rental Anda bersama platform kami.
          </p>
        </div>
      </div>

      <!-- Right Side: Form Content -->
      <div class="md:w-2/3 p-8 md:p-12">
        <!-- Alerts -->
        <div v-if="errorMsg" class="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center animate-shake">
          <Icon name="heroicons:exclamation-circle-20-solid" class="w-4 h-4 mr-2 shrink-0" />
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mb-6 p-3.5 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg flex items-center">
          <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 mr-2 shrink-0" />
          {{ successMsg }}
        </div>

        <form @submit.prevent="currentStep === 2 || role === 'CUSTOMER' ? handleRegister() : nextStep()">
          
          <!-- STEP 1: ACCOUNT INFO -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div>
              <h3 class="text-xl font-bold text-navy mb-3">Pilih Jenis Akun</h3>
              <div class="flex p-1 bg-slate-100 rounded-lg">
                <button 
                  type="button"
                  @click="role = 'CUSTOMER'"
                  class="flex-1 py-2.5 rounded-md text-sm font-bold transition-all"
                  :class="role === 'CUSTOMER' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'"
                >
                  Customer
                </button>
                <button 
                  type="button"
                  @click="role = 'MITRA'"
                  class="flex-1 py-2.5 rounded-md text-sm font-bold transition-all"
                  :class="role === 'MITRA' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'"
                >
                  Mitra
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                <input v-model="form.name" type="text" placeholder="Masukkan nama Anda" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
                <input v-model="form.email" type="email" placeholder="contoh@email.com" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <input v-model="form.password" type="password" placeholder="Min. 8 karakter" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
            </div>

            <button type="submit" class="w-full bg-navy hover:bg-primary-600 text-white py-3 rounded-lg font-bold text-sm mt-8 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95">
              <span>{{ role === 'CUSTOMER' ? 'Daftar Sekarang' : 'Lanjut ke Detail Bisnis' }}</span>
              <Icon v-if="role === 'MITRA'" name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
            </button>
          </div>

          <!-- STEP 2: MITRA BUSINESS INFO -->
          <div v-if="currentStep === 2" class="space-y-6 animate-fade-in">
            <h3 class="text-xl font-bold text-navy mb-4">Informasi Bisnis Mitra</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Toko / Rental</label>
                <input v-model="form.shopName" type="text" placeholder="Contoh: Neo PS" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">NIK (Sesuai KTP)</label>
                <input v-model="form.nik" type="text" placeholder="16 digit NIK" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Lengkap Toko</label>
              <textarea v-model="form.address" rows="3" placeholder="Jl. Contoh No. 123, Kota..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-medium text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none" required></textarea>
            </div>

            <div class="p-4 bg-primary-50 border border-primary-100 rounded-lg flex items-start space-x-3">
              <Icon name="heroicons:shield-check-20-solid" class="text-primary-600 w-5 h-5 shrink-0 mt-0.5" />
              <p class="text-xs text-primary-700 leading-relaxed font-medium">
                Data Anda aman. Pendaftaran Mitra memerlukan verifikasi admin. Akun akan aktif setelah disetujui (1-2 hari kerja).
              </p>
            </div>

            <div class="flex space-x-4 mt-8">
              <button 
                type="button" 
                @click="prevStep" 
                class="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center"
                :disabled="isLoading"
              >
                Kembali
              </button>
              <button 
                type="submit" 
                class="flex-[2] bg-navy hover:bg-primary-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                :disabled="isLoading"
              >
                <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="w-4 h-4" />
                <span>{{ isLoading ? 'Mendaftar...' : 'Selesaikan Pendaftaran' }}</span>
              </button>
            </div>
          </div>

        </form>

        <div class="mt-8 text-center">
          <p class="text-slate-500 text-sm font-medium">
            Sudah punya akun? 
            <NuxtLink to="/auth/login" class="text-navy font-bold hover:text-primary-600 ml-1 transition-colors">Masuk di sini</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>