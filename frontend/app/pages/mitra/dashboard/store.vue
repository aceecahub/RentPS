<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value || user.value?.role !== 'MITRA') {
  navigateTo('/')
}

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
const profileForm = reactive({ shopName: '', address: '', description: '' })

watchEffect(() => {
  if (mitraData.value?.shopName) {
    profileForm.shopName = mitraData.value.shopName
    profileForm.address = mitraData.value.address
    profileForm.description = mitraData.value.description
  }
})

const updateProfile = async () => {
  try {
    await $fetch(`${config.public.apiBase}/mitra/profile/${mitraId.value}`, {
      method: 'PUT',
      body: profileForm
    })
    alert('Profil toko berhasil diperbarui!')
    refreshProfile()
  } catch (err) {
    alert('Gagal memperbarui profil toko')
  }
}
</script>

<template>
  <div class="p-8 space-y-8 max-w-5xl mx-auto">
    <div class="flex items-center space-x-4 mb-6">
      <NuxtLink to="/mitra/dashboard" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-navy hover:text-white transition-colors">
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-3xl font-black text-navy">Manajemen Toko</h1>
        <p class="text-gray-500">Kelola ketersediaan Unit PlayStation dan inventaris Snack Anda.</p>
      </div>
    </div>

    <div v-if="loadingInit || !mitraId" class="animate-pulse flex space-x-4">
      <div class="h-10 w-32 bg-gray-200 rounded-xl"></div>
      <div class="h-10 w-32 bg-gray-200 rounded-xl"></div>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="flex space-x-2 border-b border-gray-100 pb-px overflow-x-auto">
        <button 
          @click="activeTab = 'units'"
          class="px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'units' ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          Unit PlayStation
        </button>
        <button 
          @click="activeTab = 'snacks'"
          class="px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'snacks' ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          Inventaris Snack
        </button>
        <button 
          @click="activeTab = 'hours'"
          class="px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'hours' ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          Jam Operasional
        </button>
        <button 
          @click="activeTab = 'photos'"
          class="px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'photos' ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          Foto Toko
        </button>
        <button 
          @click="activeTab = 'profile'"
          class="px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'profile' ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          Profil Toko
        </button>
      </div>

      <!-- UNIT TAB -->
      <div v-if="activeTab === 'units'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-navy">Daftar Unit PS</h2>
          <button @click="isAddingUnit = !isAddingUnit" class="btn-primary py-2 px-4 text-sm flex items-center">
            <Icon :name="isAddingUnit ? 'heroicons:x-mark' : 'heroicons:plus'" class="w-4 h-4 mr-2" />
            {{ isAddingUnit ? 'Batal' : 'Tambah Unit' }}
          </button>
        </div>

        <!-- Add Form -->
        <form v-if="isAddingUnit" @submit.prevent="addUnit" class="bg-gray-50 p-6 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500">Nama Unit (Misal: Seat 01)</label>
            <input v-model="unitForm.name" type="text" class="input-field" required>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500">Tipe</label>
            <select v-model="unitForm.type" class="input-field" required>
              <option value="PS3">PS 3</option>
              <option value="PS4">PS 4</option>
              <option value="PS5">PS 5</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500">Harga / Jam</label>
            <input v-model="unitForm.pricePerHour" type="number" class="input-field" required>
          </div>
          <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl transition-colors">
            Simpan Unit
          </button>
        </form>

        <!-- List -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="unit in mitraData.units" :key="unit.id" class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Icon :name="unit.type === 'PS5' ? 'heroicons:cpu-chip' : 'heroicons:computer-desktop'" class="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 class="font-bold text-navy">{{ unit.name }}</h3>
                  <p class="text-xs font-bold text-gray-400">{{ unit.type }}</p>
                </div>
              </div>
              <button @click="deleteUnit(unit.id)" class="text-red-400 hover:text-red-600">
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </div>
            <div class="flex justify-between items-end border-t border-gray-50 pt-4">
              <div>
                <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">Tarif</p>
                <p class="font-black text-navy">Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}<span class="font-normal text-xs text-gray-500">/jam</span></p>
              </div>
              <button 
                @click="toggleUnitStatus(unit)"
                class="px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                :class="unit.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'"
              >
                {{ unit.isAvailable ? 'Tersedia' : 'Sedang Dipakai' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SNACK TAB -->
      <div v-if="activeTab === 'snacks'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-navy">Inventaris Snack & Minuman</h2>
          <button @click="isAddingSnack = !isAddingSnack" class="btn-primary py-2 px-4 text-sm flex items-center">
            <Icon :name="isAddingSnack ? 'heroicons:x-mark' : 'heroicons:plus'" class="w-4 h-4 mr-2" />
            {{ isAddingSnack ? 'Batal' : 'Tambah Snack' }}
          </button>
        </div>

        <!-- Add Form -->
        <form v-if="isAddingSnack" @submit.prevent="addSnack" class="bg-gray-50 p-6 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="space-y-2 md:col-span-2">
            <label class="text-xs font-bold text-gray-500">Nama Snack/Minuman</label>
            <input v-model="snackForm.name" type="text" class="input-field" required>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500">Harga</label>
            <input v-model="snackForm.price" type="number" class="input-field" required>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500">Stok Awal</label>
            <div class="flex space-x-2">
              <input v-model="snackForm.stock" type="number" class="input-field" required>
              <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold w-12 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:check" class="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>

        <!-- List -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th class="px-6 py-4 font-bold">Produk</th>
                <th class="px-6 py-4 font-bold">Harga Satuan</th>
                <th class="px-6 py-4 font-bold">Sisa Stok</th>
                <th class="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="snack in mitraData.snacks" :key="snack.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-bold text-navy flex items-center">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                    <Icon name="heroicons:cake" class="text-gray-400 w-4 h-4" />
                  </div>
                  {{ snack.name }}
                </td>
                <td class="px-6 py-4 text-gray-600">Rp{{ parseFloat(snack.price).toLocaleString() }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded-md text-xs font-bold" :class="snack.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ snack.stock }} Pcs
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="deleteSnack(snack.id)" class="text-red-400 hover:text-red-600 p-2">
                    <Icon name="heroicons:trash" class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="!mitraData.snacks?.length">
                <td colspan="4" class="px-6 py-10 text-center text-gray-400">Belum ada inventaris snack</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- HOURS TAB -->
      <div v-if="activeTab === 'hours'" class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-navy mb-2">Jam Operasional Mingguan</h2>
          <p class="text-sm text-gray-500 mb-6">Atur jam buka dan tutup toko Anda setiap harinya.</p>
        </div>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <div v-for="day in days" :key="day" class="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
            <div class="w-32">
              <span class="font-bold text-navy">{{ formatDay(day) }}</span>
            </div>
            
            <div class="flex-1 flex items-center space-x-4">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="getDayData(day).isOpen" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                <span class="ml-3 text-sm font-medium text-gray-600">{{ getDayData(day).isOpen ? 'Buka' : 'Libur' }}</span>
              </label>
            </div>

            <div v-if="getDayData(day).isOpen" class="flex items-center space-x-3">
              <input type="time" v-model="getDayData(day).openTime" class="input-field py-2 px-3 text-sm w-32" required>
              <span class="text-gray-400 font-bold">-</span>
              <input type="time" v-model="getDayData(day).closeTime" class="input-field py-2 px-3 text-sm w-32" required>
              <button @click="saveOperatingHours(getDayData(day))" class="btn-primary py-2 px-4 text-sm ml-4">
                Simpan
              </button>
            </div>
            <div v-else class="text-sm text-gray-400 italic md:w-[320px] text-right">
              <button @click="saveOperatingHours(getDayData(day))" class="btn-primary py-2 px-4 text-sm ml-4">
                Simpan Libur
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PHOTOS TAB -->
      <div v-if="activeTab === 'photos'" class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-navy">Galeri Foto Toko</h2>
            <p class="text-sm text-gray-500">Foto yang bagus akan menarik lebih banyak pelanggan.</p>
          </div>
          <button @click="isAddingPhoto = !isAddingPhoto" class="btn-primary py-2 px-4 text-sm flex items-center">
            <Icon :name="isAddingPhoto ? 'heroicons:x-mark' : 'heroicons:plus'" class="w-4 h-4 mr-2" />
            {{ isAddingPhoto ? 'Batal' : 'Tambah Foto' }}
          </button>
        </div>

        <!-- Add Photo Form -->
        <form v-if="isAddingPhoto" @submit.prevent="addPhoto" enctype="multipart/form-data" class="bg-gray-50 p-6 rounded-2xl border border-gray-200 grid grid-cols-1 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500">Pilih File Foto</label>
            <input type="file" @change="handleFileChange" accept="image/*" class="input-field p-2" required>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500">Keterangan / Caption</label>
            <input v-model="photoForm.caption" type="text" class="input-field" placeholder="Misal: Area Tunggu Nyaman">
          </div>
          <label class="flex items-center space-x-2 cursor-pointer mt-2">
            <input type="checkbox" v-model="photoForm.isMain" class="rounded border-gray-300 text-navy focus:ring-navy">
            <span class="text-sm text-gray-600 font-medium">Jadikan Foto Utama (Cover)</span>
          </label>
          <div class="flex justify-end">
            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
              Unggah Foto
            </button>
          </div>
        </form>

        <!-- Gallery -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="photo in mitraData.photos" :key="photo.id" class="relative group rounded-3xl overflow-hidden shadow-sm border border-gray-100 aspect-square">
            <img :src="photo.photoUrl" :alt="photo.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p class="text-white font-bold text-sm">{{ photo.caption || 'Tanpa Keterangan' }}</p>
              <div class="flex justify-between items-center mt-2">
                <span v-if="photo.isMain" class="text-[10px] font-black uppercase tracking-wider bg-primary-500 text-white px-2 py-1 rounded-md">Cover</span>
                <span v-else></span>
                <button @click="deletePhoto(photo.id)" class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="!mitraData.photos?.length && !isAddingPhoto" class="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <Icon name="heroicons:photo" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500 font-medium">Belum ada foto yang diunggah.</p>
          </div>
        </div>
      </div>
      <!-- PROFILE TAB -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-navy mb-2">Informasi Toko</h2>
          <p class="text-sm text-gray-500 mb-6">Ubah detail profil toko Anda yang akan dilihat oleh pelanggan.</p>
        </div>

        <form @submit.prevent="updateProfile" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-500 uppercase tracking-wider">Nama Toko (Rental)</label>
            <input v-model="profileForm.shopName" type="text" class="input-field py-3 text-lg font-bold text-navy" required>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-500 uppercase tracking-wider">Alamat Lengkap</label>
            <textarea v-model="profileForm.address" class="input-field py-3 min-h-[100px]" required></textarea>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-500 uppercase tracking-wider">Deskripsi Singkat</label>
            <textarea v-model="profileForm.description" class="input-field py-3 min-h-[150px]" placeholder="Ceritakan keunggulan rental PS Anda (opsional)"></textarea>
          </div>

          <div class="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" class="btn-primary py-3 px-8 text-lg">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
