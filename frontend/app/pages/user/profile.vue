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
  <div class="max-w-3xl mx-auto p-6 md:p-12">
    <div class="mb-8">
      <h1 class="text-3xl font-black text-navy mb-2">Profil Saya</h1>
      <p class="text-gray-500">Kelola informasi pribadi dan data diri Anda.</p>
    </div>

    <div v-if="isLoading" class="animate-pulse flex space-x-4">
      <div class="h-32 w-full bg-gray-200 rounded-2xl"></div>
    </div>

    <form v-else @submit.prevent="saveProfile" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
      
      <!-- Avatar Section -->
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" class="w-full h-full object-cover" alt="Profile" />
          <Icon v-else name="heroicons:user" class="w-10 h-10 text-gray-300" />
        </div>
        <div class="flex-1 w-full space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">URL Foto Profil</label>
          <input v-model="profileForm.avatarUrl" type="url" class="input-field" placeholder="https://example.com/avatar.jpg">
          <p class="text-[10px] text-gray-400">Gunakan link gambar untuk foto profil Anda.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
          <input v-model="profileForm.name" type="text" class="input-field" required>
        </div>
        <!-- Email (Read Only) -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Alamat Email</label>
          <input :value="user?.email" type="email" class="input-field bg-gray-50 text-gray-500" disabled>
        </div>
        <!-- Phone -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor HP</label>
          <input v-model="profileForm.phone" type="tel" class="input-field" placeholder="08123456789">
        </div>
        <!-- NIK -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor KTP/NIK</label>
          <input v-model="profileForm.nik" type="text" class="input-field" placeholder="Masukkan NIK">
        </div>
      </div>

      <!-- Address -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Alamat Tempat Tinggal</label>
        <textarea v-model="profileForm.address" class="input-field min-h-[100px]"></textarea>
      </div>

      <div class="flex justify-end pt-6 border-t border-gray-50">
        <button type="submit" class="btn-primary py-3 px-8" :disabled="isSaving">
          <span v-if="isSaving">Menyimpan...</span>
          <span v-else>Simpan Profil</span>
        </button>
      </div>
    </form>
  </div>
</template>
