<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()


const activeTab = ref('units')
const mitraId = ref(null)

// Load Mitra details to edit
const { data: statsRes, pending: loadingInit } = await useFetch(`${config.public.apiBase}/mitra/stats`, {
  query: { userId: user.value?.id }
})

const { data: profileRes, refresh: refreshProfile } = await useFetch(() => `${config.public.apiBase}/mitra/${statsRes.value?.data?.mitraId}`, {
  immediate: false // Will trigger manually after we get mitraId
})

watchEffect(() => {
  if (statsRes.value?.data?.mitraId) {
    mitraId.value = statsRes.value.data.mitraId
    refreshProfile()
  }
})

const mitraData = computed(() => profileRes.value?.data || { units: [], snacks: [] })

// === UNIT MANAGEMENT ===
const isAddingUnit = ref(false)
const unitForm = reactive({ name: '', type: 'PS4', pricePerHour: '' })

const addUnit = async () => {
  try {
    await $fetch(`${config.public.apiBase}/ps`, {
      method: 'POST',
      body: { 
        mitraId: mitraId.value, 
        name: unitForm.name, 
        type: unitForm.type, 
        pricePerHour: parseFloat(unitForm.pricePerHour)
      }
    })
    alert('Unit berhasil ditambahkan!')
    isAddingUnit.value = false
    unitForm.name = ''
    unitForm.pricePerHour = ''
    refreshProfile()
  } catch (err) {
    alert('Gagal menambahkan unit')
  }
}

const deleteUnit = async (id) => {
  if(!confirm('Hapus unit ini?')) return
  try {
    await $fetch(`${config.public.apiBase}/ps/${id}`, { method: 'DELETE' })
    refreshProfile()
  } catch (err) { alert('Gagal menghapus') }
}

const toggleUnitStatus = async (unit) => {
  try {
    await $fetch(`${config.public.apiBase}/ps/${unit.id}`, { 
      method: 'PUT',
      body: { ...unit, isAvailable: !unit.isAvailable }
    })
    refreshProfile()
  } catch (err) { alert('Gagal update status') }
}

// === SNACK MANAGEMENT ===
const isAddingSnack = ref(false)
const snackForm = reactive({ name: '', price: '', stock: '' })

const addSnack = async () => {
  try {
    await $fetch(`${config.public.apiBase}/snack`, {
      method: 'POST',
      body: { 
        mitraId: mitraId.value, 
        name: snackForm.name, 
        price: parseFloat(snackForm.price),
        stock: parseInt(snackForm.stock)
      }
    })
    alert('Snack berhasil ditambahkan!')
    isAddingSnack.value = false
    snackForm.name = ''
    snackForm.price = ''
    snackForm.stock = ''
    refreshProfile()
  } catch (err) {
    alert('Gagal menambahkan snack')
  }
}

const deleteSnack = async (id) => {
  if(!confirm('Hapus snack ini?')) return
  try {
    await $fetch(`${config.public.apiBase}/snack/${id}`, { method: 'DELETE' })
    refreshProfile()
  } catch (err) { alert('Gagal menghapus') }
}

const isEditingSnack = ref(false)
const currentSnackId = ref(null)
const editSnackForm = reactive({ name: '', price: '', stock: '' })

const openEditSnack = (snack) => {
  currentSnackId.value = snack.id
  editSnackForm.name = snack.name
  editSnackForm.price = snack.price
  editSnackForm.stock = snack.stock
  isEditingSnack.value = true
  isAddingSnack.value = false
}

const updateSnack = async () => {
  try {
    await $fetch(`${config.public.apiBase}/snack/${currentSnackId.value}`, {
      method: 'PUT',
      body: { 
        name: editSnackForm.name, 
        price: parseFloat(editSnackForm.price),
        stock: parseInt(editSnackForm.stock)
      }
    })
    alert('Snack berhasil diperbarui!')
    isEditingSnack.value = false
    refreshProfile()
  } catch (err) {
    alert('Gagal memperbarui snack')
  }
}

// === OPERATING HOURS ===
const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const formatDay = (day) => {
  const map = { MONDAY: 'Senin', TUESDAY: 'Selasa', WEDNESDAY: 'Rabu', THURSDAY: 'Kamis', FRIDAY: 'Jumat', SATURDAY: 'Sabtu', SUNDAY: 'Minggu' }
  return map[day]
}
const getDayData = (day) => {
  const existing = mitraData.value.operatingHours?.find(h => h.day === day)
  return existing || { day, openTime: '08:00', closeTime: '22:00', isOpen: true }
}

const saveOperatingHours = async (dayData) => {
  try {
    await $fetch(`${config.public.apiBase}/mitra/operatinghours/${mitraId.value}`, {
      method: 'POST',
      body: { day: dayData.day, openTime: dayData.openTime, closeTime: dayData.closeTime, isOpen: dayData.isOpen }
    })
    alert(`Jam operasional ${formatDay(dayData.day)} diperbarui!`)
    refreshProfile()
  } catch (err) { alert('Gagal update jam operasional') }
}

// === PHOTOS ===
const isAddingPhoto = ref(false)
const photoForm = reactive({ file: null, caption: '', isMain: false })

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    photoForm.file = file
  }
}

const addPhoto = async () => {
  if (!photoForm.file) {
    alert('Silakan pilih foto terlebih dahulu')
    return
  }

  const formData = new FormData()
  formData.append('photo', photoForm.file)
  if (photoForm.caption) formData.append('caption', photoForm.caption)
  formData.append('isMain', photoForm.isMain)

  try {
    await $fetch(`${config.public.apiBase}/mitra/photo/${mitraId.value}`, {
      method: 'POST',
      body: formData
    })
    alert('Foto berhasil ditambahkan!')
    isAddingPhoto.value = false
    photoForm.file = null
    photoForm.caption = ''
    photoForm.isMain = false
    refreshProfile()
  } catch (err) {
    alert('Gagal menambahkan foto: ' + (err.response?._data?.message || err.message))
  }
}

const deletePhoto = async (id) => {
  if(!confirm('Hapus foto ini?')) return
  try {
    await $fetch(`${config.public.apiBase}/mitra/photo/${id}`, { method: 'DELETE' })
    refreshProfile()
  } catch (err) { alert('Gagal menghapus foto') }
}

// === PROFILE ===
const profileForm = reactive({ 
  name: user.value?.name || '',
  password: '',
  shopName: '', 
  address: '', 
  description: '', 
  latitude: '', 
  longitude: '', 
  npwp: '' 
})

watchEffect(() => {
  if (mitraData.value?.shopName) {
    profileForm.shopName = mitraData.value.shopName
    profileForm.address = mitraData.value.address
    profileForm.description = mitraData.value.description
    profileForm.latitude = mitraData.value.latitude || ''
    profileForm.longitude = mitraData.value.longitude || ''
    profileForm.npwp = mitraData.value.npwp || ''
  }
})

const updateProfile = async () => {
  try {
    await $fetch(`${config.public.apiBase}/mitra/profile/${mitraId.value}`, {
      method: 'PUT',
      body: profileForm
    })
    alert('Profil toko berhasil diperbarui!')
    // Update local storage user name if it changed
    if (user.value.name !== profileForm.name) {
       user.value.name = profileForm.name
       localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
    refreshProfile()
  } catch (err) {
    alert('Gagal memperbarui profil toko')
  }
}

const tabs = [
  { id: 'units', label: 'Unit PlayStation', icon: 'heroicons:computer-desktop-20-solid' },
  { id: 'snacks', label: 'Stok Snack', icon: 'heroicons:shopping-bag-20-solid' },
  { id: 'hours', label: 'Jam Kerja', icon: 'heroicons:clock-20-solid' },
  { id: 'photos', label: 'Galeri Foto', icon: 'heroicons:photo-20-solid' },
  { id: 'profile', label: 'Profil Toko', icon: 'heroicons:store-front-20-solid' },
  { id: 'account', label: 'Akun & Keamanan', icon: 'heroicons:user-circle-20-solid' },
]
</script>

<template>
  <div class="p-4 md:p-10 space-y-12 bg-gray-50/30 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="flex items-center space-x-6">
        <NuxtLink to="/mitra/dashboard" class="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-navy shadow-sm hover:shadow-lg transition-all hover:-translate-x-1 group">
          <Icon name="heroicons:arrow-left-20-solid" class="w-6 h-6 group-hover:text-primary-500 transition-colors" />
        </NuxtLink>
        <div>
          <h1 class="text-4xl font-black text-navy tracking-tight">Manajemen Toko</h1>
          <p class="text-gray-500 font-medium mt-1">Konfigurasi operasional dan inventaris rental Anda.</p>
        </div>
      </div>
      
      <div v-if="mitraData" class="flex items-center bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
        <span class="text-xs font-black uppercase tracking-widest text-navy">{{ mitraData.shopName }}</span>
      </div>
    </div>

    <div v-if="loadingInit || !mitraId" class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded-2xl animate-pulse"></div>
    </div>

    <template v-else>
      <!-- Navigation Tabs -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white p-2 rounded-[32px] border border-gray-100 shadow-xl shadow-navy/5">
        <button 
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex flex-col items-center justify-center p-4 rounded-[24px] transition-all duration-500 group"
          :class="activeTab === tab.id ? 'bg-navy text-white shadow-xl shadow-navy/20' : 'text-gray-400 hover:bg-gray-50 hover:text-navy'"
        >
          <Icon :name="tab.icon" class="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span class="text-[10px] font-black uppercase tracking-widest">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="mt-12 transition-all duration-500">
        <!-- UNIT TAB -->
        <div v-if="activeTab === 'units'" class="space-y-10 animate-fade-in">
          <div class="flex justify-between items-center">
            <h2 class="text-3xl font-black text-navy tracking-tight">Katalog Unit PlayStation</h2>
            <button @click="isAddingUnit = !isAddingUnit" class="bg-navy text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-lg shadow-navy/10 hover:bg-primary-500 hover:text-navy transition-all active:scale-95">
              <Icon :name="isAddingUnit ? 'heroicons:x-mark' : 'heroicons:plus-20-solid'" class="w-5 h-5 mr-2" />
              {{ isAddingUnit ? 'Batal Tambah' : 'Tambah Unit Baru' }}
            </button>
          </div>

          <Transition name="slide-down">
            <form v-if="isAddingUnit" @submit.prevent="addUnit" class="bg-white p-10 rounded-[40px] border border-primary-100 shadow-2xl shadow-primary-900/5 grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Unit (ID)</label>
                <input v-model="unitForm.name" type="text" placeholder="Contoh: Seat PS5-01" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Console</label>
                <select v-model="unitForm.type" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner appearance-none" required>
                  <option value="PS3">PlayStation 2</option>
                  <option value="PS3">PlayStation 3</option>
                  <option value="PS4">PlayStation 4</option>
                  <option value="PS5">PlayStation 5</option>
                </select>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tarif (Rp / Jam)</label>
                <input v-model="unitForm.pricePerHour" type="number" placeholder="Contoh: 15000" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
              </div>
              <button type="submit" class="bg-primary-500 text-navy font-black h-16 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-400 transition-all flex items-center justify-center">
                <Icon name="heroicons:check-badge-20-solid" class="w-6 h-6 mr-2" />
                Simpan Unit
              </button>
            </form>
          </Transition>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="unit in mitraData.units" :key="unit.id" class="group bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 hover:border-primary-200 hover:shadow-primary-900/10 transition-all duration-500 overflow-hidden relative">
              <div class="absolute -right-10 -top-10 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              
              <div class="flex justify-between items-start mb-10 relative z-10">
                <div class="flex items-center space-x-4">
                  <div class="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <Icon :name="unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-7 h-7 text-primary-400" />
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-navy leading-none">{{ unit.name }}</h3>
                    <p class="text-primary-500 font-black uppercase text-[9px] tracking-[0.2em] mt-2">{{ unit.type }} Console</p>
                  </div>
                </div>
                <button @click="deleteUnit(unit.id)" class="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <Icon name="heroicons:trash-20-solid" class="w-5 h-5" />
                </button>
              </div>

              <div class="flex justify-between items-end border-t border-gray-50 pt-8 relative z-10">
                <div>
                  <p class="text-[10px] uppercase font-black tracking-widest text-gray-300 mb-1">Harga Sewa</p>
                  <p class="text-2xl font-black text-navy tracking-tight">Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}<span class="text-xs font-medium text-gray-400 ml-1">/h</span></p>
                </div>
                <button 
                  @click="toggleUnitStatus(unit)"
                  class="px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase transition-all shadow-sm border"
                  :class="unit.isAvailable ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'"
                >
                  {{ unit.isAvailable ? 'Available' : 'Busy / Used' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SNACK TAB -->
        <div v-if="activeTab === 'snacks'" class="space-y-10 animate-fade-in">
          <div class="flex justify-between items-center">
            <h2 class="text-3xl font-black text-navy tracking-tight">Inventaris Snack</h2>
            <button @click="isAddingSnack = !isAddingSnack" class="bg-navy text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-lg shadow-navy/10 hover:bg-primary-500 hover:text-navy transition-all active:scale-95">
              <Icon :name="isAddingSnack ? 'heroicons:x-mark' : 'heroicons:plus-20-solid'" class="w-5 h-5 mr-2" />
              {{ isAddingSnack ? 'Batal' : 'Tambah Snack' }}
            </button>
          </div>

          <Transition name="slide-down">
            <form v-if="isAddingSnack" @submit.prevent="addSnack" class="bg-white p-10 rounded-[40px] border border-primary-100 shadow-2xl shadow-primary-900/5 grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
              <div class="space-y-3 md:col-span-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Produk</label>
                <input v-model="snackForm.name" type="text" placeholder="Contoh: Coca Cola 330ml" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Harga Satuan</label>
                <input v-model="snackForm.price" type="number" placeholder="5000" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stok Awal</label>
                <div class="flex space-x-3">
                  <input v-model="snackForm.stock" type="number" placeholder="24" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                  <button type="submit" class="bg-primary-500 text-navy font-black w-16 h-16 shrink-0 rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-400 transition-all flex items-center justify-center">
                    <Icon name="heroicons:check-20-solid" class="w-8 h-8" />
                  </button>
                </div>
              </div>
            </form>
          </Transition>

          <Transition name="slide-down">
            <form v-if="isEditingSnack" @submit.prevent="updateSnack" class="bg-white p-10 rounded-[40px] border border-blue-100 shadow-2xl shadow-blue-900/5 grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
              <div class="space-y-3 md:col-span-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Edit Nama Produk</label>
                <input v-model="editSnackForm.name" type="text" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Edit Harga</label>
                <input v-model="editSnackForm.price" type="number" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Stok</label>
                <div class="flex space-x-3">
                  <input v-model="editSnackForm.stock" type="number" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                  <button type="submit" class="bg-blue-500 text-white font-black w-16 h-16 shrink-0 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center">
                    <Icon name="heroicons:arrow-path-20-solid" class="w-8 h-8" />
                  </button>
                  <button type="button" @click="isEditingSnack = false" class="bg-red-50 text-red-500 font-black w-16 h-16 shrink-0 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center">
                    <Icon name="heroicons:x-mark-20-solid" class="w-8 h-8" />
                  </button>
                </div>
              </div>
            </form>
          </Transition>

          <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                  <th class="px-10 py-6 font-black">Detail Produk</th>
                  <th class="px-10 py-6 font-black">Harga Jual</th>
                  <th class="px-10 py-6 font-black">Inventaris</th>
                  <th class="px-10 py-6 font-black text-right">Opsi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="snack in mitraData.snacks" :key="snack.id" class="group hover:bg-primary-50/30 transition-all">
                  <td class="px-10 py-6">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                        <Icon name="heroicons:cake-20-solid" class="text-primary-500 w-6 h-6" />
                      </div>
                      <span class="font-black text-navy text-lg tracking-tight">{{ snack.name }}</span>
                    </div>
                  </td>
                  <td class="px-10 py-6">
                    <span class="font-bold text-gray-600">Rp{{ parseFloat(snack.price).toLocaleString() }}</span>
                  </td>
                  <td class="px-10 py-6">
                    <div class="flex items-center space-x-3">
                      <div class="flex-grow w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          class="h-full rounded-full transition-all duration-1000" 
                          :class="snack.stock > 10 ? 'bg-green-500' : 'bg-red-500'"
                          :style="{ width: Math.min(100, (snack.stock / 50) * 100) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs font-black uppercase tracking-widest" :class="snack.stock > 10 ? 'text-green-600' : 'text-red-600'">
                        {{ snack.stock }} Pcs
                      </span>
                    </div>
                  </td>
                  <td class="px-10 py-6 text-right">
                    <div class="flex justify-end space-x-2">
                      <button @click="openEditSnack(snack)" class="w-10 h-10 bg-white text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm border border-gray-100">
                        <Icon name="heroicons:pencil-square-20-solid" class="w-5 h-5" />
                      </button>
                      <button @click="deleteSnack(snack.id)" class="w-10 h-10 bg-white text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-gray-100">
                        <Icon name="heroicons:trash-20-solid" class="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!mitraData.snacks?.length">
                  <td colspan="4" class="px-10 py-20 text-center">
                    <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon name="heroicons:shopping-bag" class="w-10 h-10 text-gray-200" />
                    </div>
                    <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada inventaris snack terdaftar</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- HOURS TAB -->
        <div v-if="activeTab === 'hours'" class="space-y-10 animate-fade-in">
          <div class="flex items-center space-x-4 mb-2">
            <div class="w-1.5 h-8 bg-primary-500 rounded-full"></div>
            <h2 class="text-3xl font-black text-navy tracking-tight">Jam Operasional Toko</h2>
          </div>

          <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden divide-y divide-gray-50">
            <div v-for="day in days" :key="day" class="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-gray-50 transition-colors group">
              <div class="w-40">
                <span class="text-xl font-black text-navy tracking-tight group-hover:text-primary-600 transition-colors">{{ formatDay(day) }}</span>
              </div>
              
              <div class="flex-1 flex items-center space-x-4">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="getDayData(day).isOpen" class="sr-only peer">
                  <div class="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500"></div>
                  <span class="ml-4 text-sm font-black uppercase tracking-widest text-navy">{{ getDayData(day).isOpen ? 'Buka' : 'Libur' }}</span>
                </label>
              </div>

              <div v-if="getDayData(day).isOpen" class="flex flex-wrap items-center gap-4">
                <div class="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 shadow-inner">
                  <Icon name="heroicons:sun-20-solid" class="w-4 h-4 text-orange-400" />
                  <input type="time" v-model="getDayData(day).openTime" class="bg-transparent text-sm font-black text-navy focus:outline-none w-20">
                </div>
                <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4 text-gray-300" />
                <div class="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 shadow-inner">
                  <Icon name="heroicons:moon-20-solid" class="w-4 h-4 text-blue-400" />
                  <input type="time" v-model="getDayData(day).closeTime" class="bg-transparent text-sm font-black text-navy focus:outline-none w-20">
                </div>
                <button @click="saveOperatingHours(getDayData(day))" class="ml-4 bg-navy text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-navy transition-all shadow-lg shadow-navy/10 active:scale-95">
                  Update Jam
                </button>
              </div>
              <div v-else class="text-sm text-gray-400 italic md:w-[320px] text-right">
                <button @click="saveOperatingHours(getDayData(day))" class="bg-gray-100 text-gray-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-navy hover:text-white transition-all shadow-sm active:scale-95">
                  Set Sebagai Libur
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PHOTOS TAB -->
        <div v-if="activeTab === 'photos'" class="space-y-10 animate-fade-in">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-black text-navy tracking-tight">Galeri Visual Toko</h2>
              <p class="text-gray-500 font-medium mt-1">Gunakan foto dengan resolusi tinggi (HD) untuk hasil maksimal.</p>
            </div>
            <button @click="isAddingPhoto = !isAddingPhoto" class="bg-navy text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center shadow-lg shadow-navy/10 hover:bg-primary-500 hover:text-navy transition-all active:scale-95">
              <Icon :name="isAddingPhoto ? 'heroicons:x-mark' : 'heroicons:photo-20-solid'" class="w-5 h-5 mr-2" />
              {{ isAddingPhoto ? 'Batal Unggah' : 'Upload Foto Baru' }}
            </button>
          </div>

          <Transition name="slide-down">
            <form v-if="isAddingPhoto" @submit.prevent="addPhoto" enctype="multipart/form-data" class="bg-white p-10 rounded-[40px] border border-primary-100 shadow-2xl shadow-primary-900/5 space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih File Image</label>
                  <div class="relative group cursor-pointer border-2 border-dashed border-gray-100 rounded-[32px] p-8 hover:border-primary-400 hover:bg-primary-50/10 transition-all text-center">
                    <input type="file" @change="handleFileChange" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required>
                    <Icon name="heroicons:cloud-arrow-up-20-solid" class="w-12 h-12 text-primary-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p class="text-sm font-bold text-navy">{{ photoForm.file ? photoForm.file.name : 'Drag & drop atau klik untuk cari' }}</p>
                    <p class="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <div class="space-y-8 flex flex-col justify-center">
                  <div class="space-y-3">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Caption Foto</label>
                    <input v-model="photoForm.caption" type="text" placeholder="Contoh: Area Console PS5" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
                  </div>
                  <label class="flex items-center space-x-4 cursor-pointer p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                    <input type="checkbox" v-model="photoForm.isMain" class="w-5 h-5 rounded-lg border-gray-300 text-navy focus:ring-primary-500">
                    <span class="text-sm text-navy font-black uppercase tracking-widest">Gunakan Sebagai Foto Utama (Cover)</span>
                  </label>
                </div>
              </div>
              <div class="flex justify-end pt-6 border-t border-gray-50">
                <button type="submit" class="bg-primary-500 text-navy px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-400 transition-all active:scale-95">
                  Mulai Unggah Foto
                </button>
              </div>
            </form>
          </Transition>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div v-for="photo in mitraData.photos" :key="photo.id" class="group relative rounded-[40px] overflow-hidden shadow-xl shadow-navy/5 border border-gray-100 aspect-square">
              <img :src="photo.photoUrl" :alt="photo.caption" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
              <div class="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                <p class="text-white font-black text-xl tracking-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{{ photo.caption || 'Fasilitas Mitra' }}</p>
                <div class="flex justify-between items-center mt-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
                  <span v-if="photo.isMain" class="text-[9px] font-black uppercase tracking-[0.2em] bg-primary-500 text-navy px-4 py-1.5 rounded-full shadow-lg shadow-primary-500/30">Main Cover</span>
                  <div v-else></div>
                  <button @click="deletePhoto(photo.id)" class="bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl shadow-lg transition-all active:scale-95">
                    <Icon name="heroicons:trash-20-solid" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="!mitraData.photos?.length && !isAddingPhoto" class="col-span-full py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100 shadow-xl shadow-navy/5">
              <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Icon name="heroicons:photo" class="w-12 h-12 text-gray-200" />
              </div>
              <p class="text-gray-400 font-black uppercase tracking-widest text-xs">Belum ada koleksi foto toko.</p>
            </div>
          </div>
        </div>

        <!-- PROFILE TAB -->
        <div v-if="activeTab === 'profile'" class="space-y-10 animate-fade-in">
          <div class="flex items-center space-x-4 mb-2">
            <div class="w-1.5 h-8 bg-primary-500 rounded-full"></div>
            <h2 class="text-3xl font-black text-navy tracking-tight">Detail Profil Rental</h2>
          </div>

          <form @submit.prevent="updateProfile" class="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-navy/5 p-10 md:p-14 space-y-10 relative overflow-hidden group">
            <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div class="space-y-3 md:col-span-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Brand / Shop Name</label>
                <div class="relative">
                  <Icon name="heroicons:store-front-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500 w-6 h-6" />
                  <input v-model="profileForm.shopName" type="text" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 text-2xl font-black text-navy focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                </div>
              </div>
              
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Fisik Rental</label>
                <div class="relative">
                  <Icon name="heroicons:map-pin-20-solid" class="absolute left-6 top-8 text-gray-300 w-6 h-6" />
                  <textarea v-model="profileForm.address" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 min-h-[150px] text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required></textarea>
                </div>
              </div>

              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi & Keunggulan</label>
                <div class="relative">
                  <Icon name="heroicons:document-text-20-solid" class="absolute left-6 top-8 text-gray-300 w-6 h-6" />
                  <textarea v-model="profileForm.description" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 min-h-[150px] text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" placeholder="Tuliskan fasilitas spesial di rental Anda..."></textarea>
                </div>
              </div>

              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NPWP (Opsional)</label>
                <div class="relative">
                  <Icon name="heroicons:identification-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6" />
                  <input v-model="profileForm.npwp" type="text" placeholder="00.000.000.0-000.000" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Latitude</label>
                  <div class="relative">
                    <Icon name="heroicons:map-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6" />
                    <input v-model="profileForm.latitude" type="number" step="any" placeholder="-6.123456" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
                  </div>
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Longitude</label>
                  <div class="relative">
                    <Icon name="heroicons:map-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6" />
                    <input v-model="profileForm.longitude" type="number" step="any" placeholder="106.123456" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-10 border-t border-gray-50 relative z-10">
              <button type="submit" class="bg-navy text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-navy/20 hover:bg-primary-500 hover:text-navy transition-all active:scale-95 flex items-center">
                <Icon name="heroicons:check-circle-20-solid" class="w-6 h-6 mr-3" />
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>

        <!-- ACCOUNT TAB -->
        <div v-if="activeTab === 'account'" class="space-y-10 animate-fade-in">
          <div class="flex items-center space-x-4 mb-2">
            <div class="w-1.5 h-8 bg-primary-500 rounded-full"></div>
            <h2 class="text-3xl font-black text-navy tracking-tight">Pengaturan Akun Mitra</h2>
          </div>

          <form @submit.prevent="updateProfile" class="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-navy/5 p-10 md:p-14 space-y-10 relative overflow-hidden group">
            <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Pengelola</label>
                <div class="relative">
                  <Icon name="heroicons:user-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6" />
                  <input v-model="profileForm.name" type="text" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 text-xl font-black text-navy focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                </div>
              </div>

              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address (Primary)</label>
                <div class="relative">
                  <Icon name="heroicons:envelope-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input :value="user?.email" type="email" class="w-full bg-gray-100 border-2 border-transparent rounded-3xl pl-16 pr-8 py-6 text-gray-500 font-bold cursor-not-allowed" disabled>
                </div>
              </div>

              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Baru (Opsional)</label>
                <div class="relative">
                  <Icon name="heroicons:lock-closed-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6" />
                  <input v-model="profileForm.password" type="password" placeholder="••••••••" class="w-full bg-gray-50 border-2 border-gray-50 rounded-3xl pl-16 pr-8 py-6 text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner">
                </div>
                <p class="text-[10px] text-gray-400 font-medium ml-2">Kosongkan jika tidak ingin mengubah password.</p>
              </div>
            </div>

            <div class="flex justify-end pt-10 border-t border-gray-50 relative z-10">
              <button type="submit" class="bg-navy text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-navy/20 hover:bg-primary-500 hover:text-navy transition-all active:scale-95 flex items-center">
                <Icon name="heroicons:check-circle-20-solid" class="w-6 h-6 mr-3" />
                Update Akun & Keamanan
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}
</style>
