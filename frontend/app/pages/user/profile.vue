<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value || (user.value?.role !== 'CUSTOMER' && user.value?.role !== 'ADMIN')) {
  navigateTo('/auth/login')
}

const isLoading = ref(true)
const profileForm = reactive({
  name: user.value?.name || '',
  password: '',
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

const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const res = await $fetch(`${config.public.apiBase}/user/avatar/${user.value.id}`, {
      method: 'POST',
      body: formData
    })
    
    if (res.success) {
      profileForm.avatarUrl = res.data.avatarUrl
      user.value.avatarUrl = res.data.avatarUrl
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  } catch (err) {
    alert('Gagal mengunggah avatar')
  }
}

const isSaving = ref(false)
const saveProfile = async () => {
  isSaving.value = true
  try {
    await $fetch(`${config.public.apiBase}/user/profile/${user.value.id}`, {
      method: 'PUT',
      body: profileForm
    })
    
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

<<template>
  <div class="min-h-screen bg-slate-50/50 py-10">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Pengaturan Profil</h1>
        <p class="text-slate-500 text-sm font-medium mt-1">Lengkapi data diri untuk keamanan transaksi.</p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="bg-white rounded-2xl border border-slate-100 p-8 space-y-8 animate-pulse">
        <div class="flex items-center space-x-4">
          <div class="w-20 h-20 bg-slate-100 rounded-full"></div>
          <div class="space-y-2 flex-grow">
            <div class="h-4 bg-slate-100 rounded w-1/3"></div>
            <div class="h-8 bg-slate-100 rounded w-full"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div v-for="i in 4" :key="i" class="h-14 bg-slate-100 rounded-xl"></div>
        </div>
      </div>

      <form v-else @submit.prevent="saveProfile" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-8">
        
        <!-- Avatar Section -->
        <div class="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
          <div class="relative flex-shrink-0">
            <div class="w-24 h-24 rounded-full bg-navy border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
              <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" class="w-full h-full object-cover" alt="Profile" />
              <div v-else class="w-full h-full flex items-center justify-center bg-navy">
                 <Icon name="heroicons:user-solid" class="w-10 h-10 text-primary-400/50" />
              </div>
            </div>
            <button 
              type="button"
              @click="$refs.fileInput.click()"
              class="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 hover:bg-primary-600 rounded-full border-2 border-white flex items-center justify-center shadow-sm transition-colors"
            >
              <Icon name="heroicons:camera-20-solid" class="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          
          <div class="flex-grow text-center sm:text-left">
            <h3 class="text-base font-bold text-navy">Foto Profil</h3>
            <p class="text-xs text-slate-400 font-medium mt-0.5">Upload foto terbaikmu (Max 2MB)</p>
            <div class="flex gap-2 mt-3 justify-center sm:justify-start">
              <button 
                type="button"
                @click="$refs.fileInput.click()"
                class="bg-slate-50 hover:bg-slate-100 text-navy border border-slate-200 px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Icon name="heroicons:arrow-up-tray-20-solid" class="w-3.5 h-3.5" />
                Pilih Foto
              </button>
              <button 
                v-if="profileForm.avatarUrl"
                type="button"
                @click="profileForm.avatarUrl = ''"
                class="text-red-500 hover:text-red-600 font-bold text-xs transition-colors"
              >
                Hapus
              </button>
            </div>
            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange">
          </div>
        </div>

        <!-- Form Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Name -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
            <div class="relative">
              <Icon name="heroicons:identification-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                v-model="profileForm.name" 
                type="text" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                required
              >
            </div>
          </div>
          
          <!-- Email -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
            <div class="relative">
              <Icon name="heroicons:envelope-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                :value="user?.email" 
                type="email" 
                class="w-full bg-slate-100 border border-transparent rounded-lg pl-11 pr-4 py-3 text-slate-500 font-medium text-sm cursor-not-allowed"
                disabled
              >
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Baru</label>
            <div class="relative">
              <Icon name="heroicons:lock-closed-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                v-model="profileForm.password" 
                type="password" 
                placeholder="••••••••" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
            </div>
            <p class="text-[10px] text-slate-400 font-medium">Kosongkan jika tidak ingin mengubah password.</p>
          </div>
          
          <!-- Phone -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor WhatsApp</label>
            <div class="relative">
              <Icon name="heroicons:phone-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                v-model="profileForm.phone" 
                type="tel" 
                placeholder="08..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
            </div>
          </div>
          
          <!-- NIK -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">NIK (KTP)</label>
            <div class="relative">
              <Icon name="heroicons:shield-check-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                v-model="profileForm.nik" 
                type="text" 
                placeholder="16 digit NIK" 
                class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Lengkap</label>
          <div class="relative">
            <Icon name="heroicons:map-pin-20-solid" class="absolute left-4 top-4 text-slate-400 w-4 h-4" />
            <textarea 
              v-model="profileForm.address" 
              placeholder="Alamat lengkap..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 min-h-[100px] text-navy font-medium text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex justify-end pt-4">
          <button 
            type="submit" 
            class="bg-navy hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            :disabled="isSaving"
          >
            <Icon v-if="isSaving" name="svg-spinners:ring-resize" class="w-4 h-4" />
            <Icon v-else name="heroicons:check-badge-20-solid" class="w-4 h-4" />
            <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>