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
  <div class="py-10 px-4 md:px-6 space-y-10 bg-slate-50/50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/mitra/dashboard" class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-navy shadow-sm hover:bg-slate-50 transition-colors">
          <Icon name="heroicons:arrow-left-20-solid" class="w-4.5 h-4.5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Manajemen Toko</h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Konfigurasi operasional dan inventaris rental Anda.</p>
        </div>
      </div>
      
      <div v-if="mitraData" class="flex items-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2.5"></div>
        <span class="text-xs font-bold uppercase tracking-wider text-navy">{{ mitraData.shopName }}</span>
      </div>
    </div>

    <div v-if="loadingInit || !mitraId" class="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div v-for="i in 6" :key="i" class="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
    </div>

    <template v-else>
      <!-- Navigation Tabs -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
        <button 
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-355 group"
          :class="activeTab === tab.id ? 'bg-navy text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-navy'"
        >
          <Icon :name="tab.icon" class="w-5 h-5 mb-1.5 group-hover:scale-105 transition-transform" />
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="mt-8 transition-all duration-300">
        <!-- UNIT TAB -->
        <div v-if="activeTab === 'units'" class="space-y-8 animate-fade-in">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-black text-navy tracking-tight">Katalog Unit PlayStation</h2>
            <button @click="isAddingUnit = !isAddingUnit" class="bg-navy text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-sm hover:bg-primary-600 transition-colors active:scale-95">
              <Icon :name="isAddingUnit ? 'heroicons:x-mark' : 'heroicons:plus-20-solid'" class="w-4.5 h-4.5 mr-1.5" />
              {{ isAddingUnit ? 'Batal' : 'Tambah Unit' }}
            </button>
          </div>

          <Transition name="slide-down">
            <form v-if="isAddingUnit" @submit.prevent="addUnit" class="bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Nama Unit (ID)</label>
                <input v-model="unitForm.name" type="text" placeholder="Contoh: Seat PS5-01" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Jenis Console</label>
                <select v-model="unitForm.type" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none" required>
                  <option value="PS2">PlayStation 2</option>
                  <option value="PS3">PlayStation 3</option>
                  <option value="PS4">PlayStation 4</option>
                  <option value="PS5">PlayStation 5</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Tarif (Rp / Jam)</label>
                <input v-model="unitForm.pricePerHour" type="number" placeholder="Contoh: 15000" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <button type="submit" class="bg-primary-500 text-navy font-bold h-10 rounded-lg shadow-sm hover:bg-primary-600 transition-colors flex items-center justify-center text-sm">
                <Icon name="heroicons:check-badge-20-solid" class="w-5 h-5 mr-1.5" />
                Simpan Unit
              </button>
            </form>
          </Transition>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="unit in mitraData.units" :key="unit.id" class="group bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 hover:border-slate-300 transition-all relative overflow-hidden">
              <div class="flex justify-between items-start mb-6">
                <div class="flex items-center space-x-3.5">
                  <div class="w-10 h-10 bg-navy rounded-lg flex items-center justify-center shadow-sm">
                    <Icon :name="unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-5.5 h-5.5 text-primary-400" />
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-navy leading-none">{{ unit.name }}</h3>
                    <p class="text-primary-600 font-bold uppercase text-[9px] tracking-wider mt-1.5">{{ unit.type }} Console</p>
                  </div>
                </div>
                <button @click="deleteUnit(unit.id)" class="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                  <Icon name="heroicons:trash-20-solid" class="w-4.5 h-4.5" />
                </button>
              </div>

              <div class="flex justify-between items-end border-t border-slate-100 pt-5">
                <div>
                  <p class="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Harga Sewa</p>
                  <p class="text-xl font-black text-navy tracking-tight">Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}<span class="text-[10px] font-medium text-slate-400 ml-0.5">/jam</span></p>
                </div>
                <button 
                  @click="toggleUnitStatus(unit)"
                  class="px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-colors border"
                  :class="unit.isAvailable ? 'bg-green-50 text-green-700 border-green-150 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-150 hover:bg-red-100'"
                >
                  {{ unit.isAvailable ? 'Available' : 'Busy / Used' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SNACK TAB -->
        <div v-if="activeTab === 'snacks'" class="space-y-8 animate-fade-in">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-black text-navy tracking-tight">Inventaris Snack</h2>
            <button @click="isAddingSnack = !isAddingSnack" class="bg-navy text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-sm hover:bg-primary-600 transition-colors active:scale-95">
              <Icon :name="isAddingSnack ? 'heroicons:x-mark' : 'heroicons:plus-20-solid'" class="w-4.5 h-4.5 mr-1.5" />
              {{ isAddingSnack ? 'Batal' : 'Tambah Snack' }}
            </button>
          </div>

          <Transition name="slide-down">
            <form v-if="isAddingSnack" @submit.prevent="addSnack" class="bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div class="space-y-2 md:col-span-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Nama Produk</label>
                <input v-model="snackForm.name" type="text" placeholder="Contoh: Coca Cola 330ml" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Harga Satuan</label>
                <input v-model="snackForm.price" type="number" placeholder="5000" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Stok Awal</label>
                <div class="flex space-x-3">
                  <input v-model="snackForm.stock" type="number" placeholder="24" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
                  <button type="submit" class="bg-primary-500 text-navy font-bold w-10 h-10 shrink-0 rounded-lg shadow-sm hover:bg-primary-600 transition-colors flex items-center justify-center">
                    <Icon name="heroicons:check-20-solid" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </Transition>

          <Transition name="slide-down">
            <form v-if="isEditingSnack" @submit.prevent="updateSnack" class="bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div class="space-y-2 md:col-span-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Edit Nama Produk</label>
                <input v-model="editSnackForm.name" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Edit Harga</label>
                <input v-model="editSnackForm.price" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Update Stok</label>
                <div class="flex space-x-3">
                  <input v-model="editSnackForm.stock" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
                  <button type="submit" class="bg-navy text-white font-bold w-10 h-10 shrink-0 rounded-lg shadow-sm hover:bg-navy-600 transition-colors flex items-center justify-center">
                    <Icon name="heroicons:arrow-path-20-solid" class="w-5 h-5" />
                  </button>
                  <button type="button" @click="isEditingSnack = false" class="bg-red-50 text-red-500 font-bold w-10 h-10 shrink-0 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center">
                    <Icon name="heroicons:x-mark-20-solid" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </Transition>

          <div class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-150">
                  <th class="px-6 py-3.5 font-bold">Detail Produk</th>
                  <th class="px-6 py-3.5 font-bold">Harga Jual</th>
                  <th class="px-6 py-3.5 font-bold">Inventaris</th>
                  <th class="px-6 py-3.5 font-bold text-right">Opsi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="snack in mitraData.snacks" :key="snack.id" class="group hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3.5">
                      <div class="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Icon name="heroicons:cake-20-solid" class="text-primary-500 w-5 h-5" />
                      </div>
                      <span class="font-bold text-navy text-base tracking-tight">{{ snack.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="font-bold text-slate-600">Rp{{ parseFloat(snack.price).toLocaleString() }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div class="flex-grow w-24 h-1.5 bg-slate-100 rounded overflow-hidden">
                        <div 
                          class="h-full transition-all duration-1000" 
                          :class="snack.stock > 10 ? 'bg-green-500' : 'bg-red-500'"
                          :style="{ width: Math.min(100, (snack.stock / 50) * 100) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs font-bold uppercase tracking-wider" :class="snack.stock > 10 ? 'text-green-600' : 'text-red-600'">
                        {{ snack.stock }} Pcs
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end space-x-2">
                      <button @click="openEditSnack(snack)" class="w-8 h-8 bg-slate-50 hover:bg-navy hover:text-white text-navy border border-slate-200 rounded-lg transition-colors flex items-center justify-center shadow-sm">
                        <Icon name="heroicons:pencil-square-20-solid" class="w-4.5 h-4.5" />
                      </button>
                      <button @click="deleteSnack(snack.id)" class="w-8 h-8 bg-slate-50 hover:bg-red-500 hover:text-white text-red-500 border border-slate-200 rounded-lg transition-colors flex items-center justify-center shadow-sm">
                        <Icon name="heroicons:trash-20-solid" class="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!mitraData.snacks?.length">
                  <td colspan="4" class="px-6 py-16 text-center">
                    <div class="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="heroicons:shopping-bag" class="w-7 h-7 text-slate-300" />
                    </div>
                    <p class="text-slate-400 font-bold uppercase tracking-wider text-xs">Belum ada inventaris snack terdaftar</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- HOURS TAB -->
        <div v-if="activeTab === 'hours'" class="space-y-8 animate-fade-in">
          <div class="flex items-center space-x-2.5 mb-2">
            <div class="w-1 h-6 bg-primary-500 rounded"></div>
            <h2 class="text-xl font-black text-navy tracking-tight">Jam Operasional Toko</h2>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden divide-y divide-slate-100">
            <div v-for="day in days" :key="day" class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group">
              <div class="w-36">
                <span class="text-base font-bold text-navy tracking-tight group-hover:text-primary-600 transition-colors">{{ formatDay(day) }}</span>
              </div>
              
              <div class="flex-1 flex items-center space-x-4">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="getDayData(day).isOpen" class="sr-only peer">
                  <div class="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary-500"></div>
                  <span class="ml-3 text-xs font-bold uppercase tracking-wider text-navy">{{ getDayData(day).isOpen ? 'Buka' : 'Libur' }}</span>
                </label>
              </div>

              <div v-if="getDayData(day).isOpen" class="flex flex-wrap items-center gap-3">
                <div class="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
                  <Icon name="heroicons:sun-20-solid" class="w-4 h-4 text-orange-400" />
                  <input type="time" v-model="getDayData(day).openTime" class="bg-transparent text-xs font-bold text-navy focus:outline-none w-16">
                </div>
                <Icon name="heroicons:arrow-right-20-solid" class="w-3.5 h-3.5 text-slate-300" />
                <div class="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
                  <Icon name="heroicons:moon-20-solid" class="w-4 h-4 text-blue-400" />
                  <input type="time" v-model="getDayData(day).closeTime" class="bg-transparent text-xs font-bold text-navy focus:outline-none w-16">
                </div>
                <button @click="saveOperatingHours(getDayData(day))" class="ml-2 bg-navy hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm">
                  Update Jam
                </button>
              </div>
              <div v-else class="text-sm text-slate-400 italic md:w-[320px] text-right">
                <button @click="saveOperatingHours(getDayData(day))" class="bg-slate-100 hover:bg-navy hover:text-white text-slate-500 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors">
                  Set Sebagai Libur
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PHOTOS TAB -->
        <div v-if="activeTab === 'photos'" class="space-y-8 animate-fade-in">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-black text-navy tracking-tight">Galeri Visual Toko</h2>
              <p class="text-slate-500 text-sm font-medium mt-1">Gunakan foto dengan resolusi tinggi (HD) untuk hasil maksimal.</p>
            </div>
            <button @click="isAddingPhoto = !isAddingPhoto" class="bg-navy text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-sm hover:bg-primary-600 transition-colors active:scale-95">
              <Icon :name="isAddingPhoto ? 'heroicons:x-mark' : 'heroicons:photo-20-solid'" class="w-4.5 h-4.5 mr-1.5" />
              {{ isAddingPhoto ? 'Batal' : 'Upload Foto' }}
            </button>
          </div>

          <Transition name="slide-down">
            <form v-if="isAddingPhoto" @submit.prevent="addPhoto" enctype="multipart/form-data" class="bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Pilih File Image</label>
                  <div class="relative group cursor-pointer border border-dashed border-slate-250 rounded-xl p-6 hover:border-primary-500 hover:bg-primary-50/5 transition-all text-center">
                    <input type="file" @change="handleFileChange" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required>
                    <Icon name="heroicons:cloud-arrow-up-20-solid" class="w-10 h-10 text-primary-500 mx-auto mb-2 group-hover:scale-105 transition-transform" />
                    <p class="text-sm font-bold text-navy">{{ photoForm.file ? photoForm.file.name : 'Drag & drop atau klik untuk cari' }}</p>
                    <p class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <div class="space-y-6 flex flex-col justify-center">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Caption Foto</label>
                    <input v-model="photoForm.caption" type="text" placeholder="Contoh: Area Console PS5" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all">
                  </div>
                  <label class="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white hover:border-slate-200 transition-all">
                    <input type="checkbox" v-model="photoForm.isMain" class="w-4 h-4 rounded border-slate-300 text-navy focus:ring-primary-500">
                    <span class="text-xs text-navy font-bold uppercase tracking-wider">Gunakan Sebagai Foto Utama (Cover)</span>
                  </label>
                </div>
              </div>
              <div class="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" class="bg-primary-500 text-navy px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-primary-600 transition-colors">
                  Mulai Unggah Foto
                </button>
              </div>
            </form>
          </Transition>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div v-for="photo in mitraData.photos" :key="photo.id" class="group relative rounded-xl overflow-hidden shadow-md border border-slate-200 aspect-square bg-slate-50">
              <img :src="photo.photoUrl" :alt="photo.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                <p class="text-white font-bold text-base tracking-tight translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{{ photo.caption || 'Fasilitas Mitra' }}</p>
                <div class="flex justify-between items-center mt-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span v-if="photo.isMain" class="text-[9px] font-bold uppercase tracking-wider bg-primary-500 text-navy px-2 py-0.5 rounded shadow-sm">Main Cover</span>
                  <div v-else></div>
                  <button @click="deletePhoto(photo.id)" class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-colors active:scale-95">
                    <Icon name="heroicons:trash-20-solid" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="!mitraData.photos?.length && !isAddingPhoto" class="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-250 shadow-lg shadow-slate-200/50">
              <div class="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Icon name="heroicons:photo" class="w-8 h-8 text-slate-300" />
              </div>
              <p class="text-slate-400 font-bold uppercase tracking-wider text-xs">Belum ada koleksi foto toko.</p>
            </div>
          </div>
        </div>

        <!-- PROFILE TAB -->
        <div v-if="activeTab === 'profile'" class="space-y-8 animate-fade-in">
          <div class="flex items-center space-x-2.5 mb-2">
            <div class="w-1 h-6 bg-primary-500 rounded"></div>
            <h2 class="text-xl font-black text-navy tracking-tight">Detail Profil Rental</h2>
          </div>

          <form @submit.prevent="updateProfile" class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 md:p-8 space-y-6 relative overflow-hidden group">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div class="space-y-2 md:col-span-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Nama Brand / Shop Name</label>
                <div class="relative">
                  <Icon name="heroicons:store-front-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input v-model="profileForm.shopName" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-base font-bold text-navy focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Alamat Fisik Rental</label>
                <div class="relative">
                  <Icon name="heroicons:map-pin-20-solid" class="absolute left-4 top-4 text-slate-350 w-5 h-5" />
                  <textarea v-model="profileForm.address" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 min-h-[120px] text-sm text-navy font-semibold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required></textarea>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Deskripsi & Keunggulan</label>
                <div class="relative">
                  <Icon name="heroicons:document-text-20-solid" class="absolute left-4 top-4 text-slate-350 w-5 h-5" />
                  <textarea v-model="profileForm.description" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 min-h-[120px] text-sm text-navy font-semibold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" placeholder="Tuliskan fasilitas spesial di rental Anda..."></textarea>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">NPWP (Opsional)</label>
                <div class="relative">
                  <Icon name="heroicons:identification-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350 w-5 h-5" />
                  <input v-model="profileForm.npwp" type="text" placeholder="00.000.000.0-000.000" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-sm text-navy font-semibold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Latitude</label>
                  <div class="relative">
                    <Icon name="heroicons:map-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350 w-5 h-5" />
                    <input v-model="profileForm.latitude" type="number" step="any" placeholder="-6.123456" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-sm text-navy font-semibold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all">
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Longitude</label>
                  <div class="relative">
                    <Icon name="heroicons:map-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350 w-5 h-5" />
                    <input v-model="profileForm.longitude" type="number" step="any" placeholder="106.123456" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-sm text-navy font-semibold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all">
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-5 border-t border-slate-100 relative z-10">
              <button type="submit" class="bg-navy hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center">
                <Icon name="heroicons:check-circle-20-solid" class="w-5 h-5 mr-2" />
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>

        <!-- ACCOUNT TAB -->
        <div v-if="activeTab === 'account'" class="space-y-8 animate-fade-in">
          <div class="flex items-center space-x-2.5 mb-2">
            <div class="w-1 h-6 bg-primary-500 rounded"></div>
            <h2 class="text-xl font-black text-navy tracking-tight">Pengaturan Akun Mitra</h2>
          </div>

          <form @submit.prevent="updateProfile" class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 md:p-8 space-y-6 relative overflow-hidden group">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Nama Lengkap Pengelola</label>
                <div class="relative">
                  <Icon name="heroicons:user-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350 w-5 h-5" />
                  <input v-model="profileForm.name" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-sm font-bold text-navy focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all" required>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Email Address (Primary)</label>
                <div class="relative">
                  <Icon name="heroicons:envelope-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input :value="user?.email" type="email" class="w-full bg-slate-100 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-sm text-slate-550 font-bold cursor-not-allowed" disabled>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Password Baru (Opsional)</label>
                <div class="relative">
                  <Icon name="heroicons:lock-closed-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350 w-5 h-5" />
                  <input v-model="profileForm.password" type="password" placeholder="••••••••" class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-sm text-navy font-semibold focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all">
                </div>
                <p class="text-[10px] text-slate-400 font-medium ml-1">Kosongkan jika tidak ingin mengubah password.</p>
              </div>
            </div>

            <div class="flex justify-end pt-5 border-t border-slate-100 relative z-10">
              <button type="submit" class="bg-navy hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center">
                <Icon name="heroicons:check-circle-20-solid" class="w-5 h-5 mr-2" />
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
