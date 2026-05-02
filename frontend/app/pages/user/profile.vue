<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value) {
  navigateTo('/auth/login')
}

const isLoading = ref(true)
const profileForm = reactive({
  name: user.value?.name || '',
  phone: '',
  address: '',
  avatarUrl: '',
  nik: ''
})

onMounted(async () => {
  if (user.value?.id) {
    try {
      const { data } = await $fetch(`${config.public.apiBase}/user/profile/${user.value.id}`)
      if (data) {
        profileForm.name = data.user.name
        profileForm.phone = data.phone || ''
        profileForm.address = data.address || ''
        profileForm.avatarUrl = data.avatarUrl || ''
        profileForm.nik = data.nik ? String(data.nik) : ''
      }
    } catch (err) {
      console.error('Failed to fetch profile', err)
    } finally {
      isLoading.value = false
    }
  }
})

const isSaving = ref(false)
const saveProfile = async () => {
  isSaving.value = true
  try {
    await $fetch(`${config.public.apiBase}/user/profile/${user.value.id}`, {
      method: 'PUT',
      body: profileForm
    })
    
    // Update local storage user name if it changed
    if (user.value.name !== profileForm.name) {
       user.value.name = profileForm.name
       localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
    
    alert('Profil berhasil diperbarui!')
  } catch (err) {
    alert('Gagal memperbarui profil')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="p-4 md:p-10 space-y-12 bg-gray-50/30 min-h-screen">
    <!-- Header -->
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="text-4xl font-black text-navy tracking-tight">Pengaturan Profil</h1>
        <p class="text-gray-500 font-medium mt-1">Lengkapi data diri Anda untuk keamanan transaksi.</p>
      </div>
      <div class="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-primary-500 shadow-xl shadow-navy/20">
        <Icon name="heroicons:user-circle-20-solid" class="w-7 h-7" />
      </div>
    </div>

    <div class="max-w-4xl mx-auto">
      <div v-if="isLoading" class="bg-white rounded-[48px] border border-gray-100 p-12 space-y-10 animate-pulse">
        <div class="flex items-center space-x-6">
          <div class="w-24 h-24 bg-gray-100 rounded-full"></div>
          <div class="space-y-3 flex-grow">
            <div class="h-4 bg-gray-100 rounded w-1/4"></div>
            <div class="h-10 bg-gray-100 rounded w-full"></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-8">
          <div v-for="i in 4" :key="i" class="h-16 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>

      <form v-else @submit.prevent="saveProfile" class="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-navy/5 p-10 md:p-14 space-y-12 relative overflow-hidden group">
        <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
        
        <!-- Avatar Section -->
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div class="relative">
            <div class="w-32 h-32 rounded-full bg-navy border-4 border-white shadow-2xl overflow-hidden flex-shrink-0 flex items-center justify-center transform transition-transform group-hover:scale-105 duration-500">
              <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" class="w-full h-full object-cover" alt="Profile" />
              <Icon v-else name="heroicons:user-solid" class="w-16 h-16 text-primary-400/50" />
            </div>
            <div class="absolute bottom-1 right-1 w-8 h-8 bg-primary-500 rounded-full border-4 border-white flex items-center justify-center">
              <Icon name="heroicons:camera-20-solid" class="w-4 h-4 text-navy" />
            </div>
          </div>
          
          <div class="flex-grow w-full space-y-3">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Profile Photo URL</label>
            <div class="relative">
              <Icon name="heroicons:link-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input v-model="profileForm.avatarUrl" type="url" placeholder="https://..." class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-8 py-5 text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
            </div>
            <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-1 leading-relaxed">Paste a link to your profile picture from Imgur or other image hosts.</p>
          </div>
        </div>

        <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <!-- Name -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
            <div class="relative">
              <Icon name="heroicons:identification-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input v-model="profileForm.name" type="text" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-8 py-5 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
            </div>
          </div>
          
          <!-- Email (Read Only) -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div class="relative">
              <Icon name="heroicons:envelope-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input :value="user?.email" type="email" class="w-full bg-gray-100 border-2 border-transparent rounded-2xl pl-16 pr-8 py-5 text-gray-500 font-bold cursor-not-allowed" disabled>
            </div>
          </div>
          
          <!-- Phone -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
            <div class="relative">
              <Icon name="heroicons:phone-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input v-model="profileForm.phone" type="tel" placeholder="08..." class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-8 py-5 text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
            </div>
          </div>
          
          <!-- NIK -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">NIK (Identity Card)</label>
            <div class="relative">
              <Icon name="heroicons:shield-check-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input v-model="profileForm.nik" type="text" placeholder="Masukkan 16 digit NIK" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-8 py-5 text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="relative z-10 space-y-3">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Address</label>
          <div class="relative">
            <Icon name="heroicons:map-pin-20-solid" class="absolute left-6 top-6 text-gray-300 w-5 h-5" />
            <textarea v-model="profileForm.address" placeholder="Tuliskan alamat lengkap pengiriman/jemputan..." class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 min-h-[120px] text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner"></textarea>
          </div>
        </div>

        <div class="relative z-10 flex justify-end pt-10 border-t border-gray-50">
          <button 
            type="submit" 
            class="bg-navy text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-navy/20 hover:bg-primary-500 hover:text-navy transition-all active:scale-[0.98] flex items-center group/btn disabled:opacity-50 disabled:cursor-not-allowed" 
            :disabled="isSaving"
          >
            <Icon v-if="isSaving" name="svg-spinners:ring-resize" class="w-5 h-5 mr-3" />
            <Icon v-else name="heroicons:check-badge-20-solid" class="w-5 h-5 mr-3 transform group-hover/btn:scale-110 transition-transform" />
            {{ isSaving ? 'Saving Changes...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
