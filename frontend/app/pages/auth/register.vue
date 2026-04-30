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
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
      
      <!-- Left Side: Progress & Info -->
      <div class="md:w-1/3 bg-navy p-10 text-white flex flex-col justify-between">
        <div>
          <NuxtLink to="/" class="flex items-center space-x-2 mb-10 group">
            <Icon name="heroicons:arrow-left" class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span class="text-sm font-bold text-gray-400 group-hover:text-white">Beranda</span>
          </NuxtLink>
          
          <h2 class="text-3xl font-black mb-6 leading-tight">Daftar Akun</h2>
          
          <!-- Stepper UI -->
          <div class="space-y-8">
            <div class="flex items-center space-x-4">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all"
                :class="currentStep >= 1 ? 'bg-white text-navy border-white' : 'border-white/20 text-white/40'"
              >
                1
              </div>
              <div>
                <p class="text-sm font-bold">Informasi Akun</p>
                <p class="text-xs text-white/50">Email & Password</p>
              </div>
            </div>
            
            <div v-if="role === 'MITRA'" class="flex items-center space-x-4">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all"
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

        <div class="mt-20 pt-10 border-t border-white/10">
          <p class="text-xs text-gray-400 leading-relaxed">
            Daftar sekarang untuk mulai menyewa atau kembangkan bisnis rental Anda bersama platform kami.
          </p>
        </div>
      </div>

      <!-- Right Side: Form Content -->
      <div class="md:w-2/3 p-10 md:p-16">
        <!-- Alerts -->
        <div v-if="errorMsg" class="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center animate-shake">
          <Icon name="heroicons:exclamation-circle" class="w-5 h-5 mr-3" />
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mb-8 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-2xl flex items-center">
          <Icon name="heroicons:check-circle" class="w-5 h-5 mr-3" />
          {{ successMsg }}
        </div>

        <form @submit.prevent="currentStep === 2 || role === 'CUSTOMER' ? handleRegister() : nextStep()">
          
          <!-- STEP 1: ACCOUNT INFO -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="mb-8">
              <h3 class="text-2xl font-bold text-navy mb-2">Pilih Jenis Akun</h3>
              <div class="flex p-1 bg-gray-100 rounded-2xl">
                <button 
                  type="button"
                  @click="role = 'CUSTOMER'"
                  class="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                  :class="role === 'CUSTOMER' ? 'bg-white text-navy shadow-md' : 'text-gray-500'"
                >
                  Customer
                </button>
                <button 
                  type="button"
                  @click="role = 'MITRA'"
                  class="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                  :class="role === 'MITRA' ? 'bg-white text-navy shadow-md' : 'text-gray-500'"
                >
                  Mitra
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-xs font-black text-navy uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input v-model="form.name" type="text" placeholder="Masukkan nama Anda" class="input-field py-4" required>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-navy uppercase tracking-widest ml-1">Alamat Email</label>
                <input v-model="form.email" type="email" placeholder="contoh@email.com" class="input-field py-4" required>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-navy uppercase tracking-widest ml-1">Password</label>
                <input v-model="form.password" type="password" placeholder="Min. 8 karakter" class="input-field py-4" required>
              </div>
            </div>

            <button type="submit" class="w-full btn-primary py-4 text-lg mt-10 shadow-xl shadow-navy/20 flex items-center justify-center">
              {{ role === 'CUSTOMER' ? 'Daftar Sekarang' : 'Lanjut ke Detail Bisnis' }}
              <Icon v-if="role === 'MITRA'" name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </button>
          </div>

          <!-- STEP 2: MITRA BUSINESS INFO -->
          <div v-if="currentStep === 2" class="space-y-6 animate-fade-in">
            <h3 class="text-2xl font-bold text-navy mb-6">Informasi Bisnis Mitra</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-black text-navy uppercase tracking-widest ml-1">Nama Toko / Rental</label>
                <input v-model="form.shopName" type="text" placeholder="Contoh: Neo PS" class="input-field py-4" required>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-navy uppercase tracking-widest ml-1">NIK (Sesuai KTP)</label>
                <input v-model="form.nik" type="text" placeholder="16 digit NIK" class="input-field py-4" required>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black text-navy uppercase tracking-widest ml-1">Alamat Lengkap Toko</label>
              <textarea v-model="form.address" rows="3" placeholder="Jl. Contoh No. 123, Kota..." class="input-field py-4 resize-none" required></textarea>
            </div>

            <div class="p-4 bg-primary-50 rounded-2xl flex items-start space-x-4">
              <Icon name="heroicons:shield-check" class="text-primary-600 w-10 h-10 shrink-0" />
              <p class="text-xs text-primary-700 leading-relaxed">
                Data Anda aman. Pendaftaran Mitra memerlukan verifikasi admin. Akun akan aktif setelah disetujui (1-2 hari kerja).
              </p>
            </div>

            <div class="flex space-x-4 mt-10">
              <button 
                type="button" 
                @click="prevStep" 
                class="flex-1 btn-outline py-4 flex items-center justify-center"
                :disabled="isLoading"
              >
                Kembali
              </button>
              <button 
                type="submit" 
                class="flex-[2] btn-primary py-4 text-lg shadow-xl shadow-navy/20 flex items-center justify-center"
                :disabled="isLoading"
              >
                <Icon v-if="isLoading" name="svg-spinners:ring-resize" class="w-6 h-6 mr-2" />
                {{ isLoading ? 'Mendaftar...' : 'Selesaikan Pendaftaran' }}
              </button>
            </div>
          </div>

        </form>

        <div class="mt-12 text-center">
          <p class="text-gray-500 text-sm">
            Sudah punya akun? 
            <NuxtLink to="/auth/login" class="text-navy font-bold hover:underline">Masuk di sini</NuxtLink>
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
</style>