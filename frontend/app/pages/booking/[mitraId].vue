<script setup>
const route = useRoute()
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

const mitraId = route.params.mitraId
const unitId = route.query.unitId

if (!isLoggedIn.value) {
  navigateTo('/auth/login')
}

// Fetch Mitra Details to get unit and snacks
const { data: response, pending } = await useFetch(`${config.public.apiBase}/mitra/${mitraId}`)
const mitra = computed(() => response.value?.data || null)
const selectedUnit = computed(() => mitra.value?.units.find(u => u.id === parseInt(unitId)))

// Form Data - NIK & phone akan diisi otomatis dari profil user
const form = reactive({
  date: new Date().toISOString().split('T')[0],
  startTime: '10:00',
  durationHour: 2,
  renterName: user.value?.name || '',
  renterNik: '',
  renterPhone: '',
  renterPhoto: '',
  snacks: []
})

// Fetch profil user untuk pre-fill data penyewa
onMounted(async () => {
  if (user.value?.id) {
    try {
      const res = await $fetch(`${config.public.apiBase}/user/profile/${user.value.id}`)
      if (res?.data) {
        form.renterNik = res.data.nik || ''
        form.renterPhone = res.data.phone || ''
      }
    } catch (e) {
      console.warn('Gagal memuat profil user untuk booking', e)
    }
  }
})

// Fetch Schedule for the selected date
const { data: scheduleResponse, pending: schedulePending } = await useFetch(() => `${config.public.apiBase}/booking/unit/${unitId}/schedule`, {
  query: { date: computed(() => form.date) }
})
const unitSchedules = computed(() => scheduleResponse.value?.data || [])

// Calculate End Time based on duration
const calculateEndTime = () => {
  if (!form.date || !form.startTime) return null
  const start = new Date(`${form.date}T${form.startTime}`)
  const end = new Date(start.getTime() + form.durationHour * 60 * 60 * 1000)
  return end
}

// Handle Snack Selection
const toggleSnack = (snack) => {
  const existing = form.snacks.find(s => s.snackId === snack.id)
  if (existing) {
    existing.quantity++
  } else {
    form.snacks.push({
      snackId: snack.id,
      name: snack.name,
      quantity: 1,
      priceAtBooking: snack.price
    })
  }
}

const decreaseSnack = (snackId) => {
  const index = form.snacks.findIndex(s => s.snackId === snackId)
  if (index !== -1) {
    if (form.snacks[index].quantity > 1) {
      form.snacks[index].quantity--
    } else {
      form.snacks.splice(index, 1)
    }
  }
}

// Calculate Totals
const subtotalUnit = computed(() => {
  if (!selectedUnit.value) return 0
  return selectedUnit.value.pricePerHour * form.durationHour
})

const subtotalSnacks = computed(() => {
  return form.snacks.reduce((total, s) => total + (s.priceAtBooking * s.quantity), 0)
})

const totalPrice = computed(() => subtotalUnit.value + subtotalSnacks.value)

// Submit Booking
const isSubmitting = ref(false)
const errorMsg = ref('')

const submitBooking = async () => {
  if (!form.date || !form.startTime || !form.durationHour) {
    errorMsg.value = 'Mohon lengkapi jadwal bermain (Tanggal, Jam, Durasi).'
    return
  }
  if (!form.renterName || !form.renterNik || !form.renterPhone) {
    errorMsg.value = 'Mohon lengkapi Data Penyewa (Nama, NIK, No. WhatsApp).'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''
  
  try {
    const startDateTime = new Date(`${form.date}T${form.startTime}`).toISOString()
    const endDateTime = calculateEndTime().toISOString()

    const bookingData = {
      userId: user.value.id,
      mitraId: parseInt(mitraId),
      unitId: parseInt(unitId),
      startTime: startDateTime,
      endTime: endDateTime,
      durationHour: form.durationHour,
      totalPrice: totalPrice.value,
      renterName: form.renterName,
      renterNik: form.renterNik,
      renterPhone: form.renterPhone,
      renterPhoto: form.renterPhoto,
      snacks: form.snacks
    }

    const res = await $fetch(`${config.public.apiBase}/booking`, {
      method: 'POST',
      body: bookingData
    })

    if (res.success) {
      alert('Booking berhasil dibuat!')
      navigateTo('/user/bookings') // Asumsi ada dashboard user nanti
    } else {
      errorMsg.value = res.message || 'Gagal membuat booking'
    }
  } catch (error) {
    errorMsg.value = error.response?._data?.message || error.message || 'Terjadi kesalahan sistem'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div v-if="pending" class="text-center py-20 animate-pulse">
      <div class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
      <div class="h-6 w-48 bg-gray-200 rounded mx-auto"></div>
    </div>

    <div v-else-if="!selectedUnit" class="text-center py-20">
      <h3 class="text-xl font-bold text-navy">Unit Tidak Ditemukan</h3>
      <NuxtLink :to="`/mitra/${mitraId}`" class="text-primary-600 mt-4 inline-block hover:underline">Kembali ke halaman Mitra</NuxtLink>
    </div>

    <template v-else>
      <div class="mb-8">
        <h1 class="text-3xl font-black text-navy mb-2">Selesaikan Booking Anda</h1>
        <p class="text-gray-500">Rental di <span class="font-bold text-navy">{{ mitra.shopName }}</span></p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Left: Form Input -->
        <div class="lg:col-span-2 space-y-8">
          
          <div v-if="errorMsg" class="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center">
            <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 mr-3" />
            {{ errorMsg }}
          </div>

          <!-- Unit Info Card -->
          <div class="bg-primary-50 rounded-3xl p-6 border border-primary-100 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                <Icon :name="selectedUnit.type === 'PS5' ? 'heroicons:cpu-chip' : 'heroicons:computer-desktop'" class="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 class="font-bold text-navy text-lg">{{ selectedUnit.name }}</h3>
                <p class="text-primary-700">Rp{{ parseFloat(selectedUnit.pricePerHour).toLocaleString() }} / Jam</p>
              </div>
            </div>
            <span class="bg-white text-primary-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">Terpilih</span>
          </div>

          <form @submit.prevent="submitBooking" class="space-y-8">
            <!-- Time Selection -->
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 class="text-xl font-bold text-navy mb-6">Pilih Jadwal Bermain</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</label>
                  <input type="date" v-model="form.date" class="input-field py-3" required>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Jam Mulai</label>
                  <input type="time" v-model="form.startTime" class="input-field py-3" required>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Durasi (Jam)</label>
                  <input type="number" min="1" max="12" v-model="form.durationHour" class="input-field py-3" required>
                </div>
              </div>

              <!-- Schedule Table Info -->
              <div class="mt-8 border-t border-gray-100 pt-6">
                <h3 class="text-sm font-bold text-navy mb-4 flex items-center">
                  <Icon name="heroicons:clock" class="w-4 h-4 mr-2 text-primary-500" />
                  Jadwal Terisi pada {{ new Date(form.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
                </h3>
                
                <div v-if="schedulePending" class="animate-pulse flex space-x-2">
                  <div class="h-8 bg-gray-100 rounded w-full"></div>
                </div>
                <div v-else-if="unitSchedules.length === 0" class="p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
                  <Icon name="heroicons:check-circle" class="w-5 h-5 inline-block mr-1 align-text-bottom" />
                  Belum ada yang mem-booking unit ini pada tanggal tersebut. Jadwal kosong 100%!
                </div>
                <div v-else class="space-y-2">
                  <div v-for="sched in unitSchedules" :key="sched.id" class="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                    <span class="font-bold">
                      {{ new Date(sched.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} - 
                      {{ new Date(sched.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                    <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-lg font-bold">Dibooking</span>
                  </div>
                  <p class="text-xs text-gray-500 italic mt-2">*Hindari memilih waktu yang beririsan dengan jadwal di atas.</p>
                </div>
              </div>
            </div>

            <!-- Identity Input -->
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-navy">Data Penyewa</h2>
                <div v-if="form.renterNik && form.renterPhone" class="flex items-center text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-1" />
                  Terisi dari profil
                </div>
                <NuxtLink v-else to="/user/profile" class="text-xs text-primary-600 hover:underline flex items-center">
                  <Icon name="heroicons:arrow-right" class="w-3 h-3 mr-1" />
                  Lengkapi profil dulu
                </NuxtLink>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                  <input type="text" v-model="form.renterName" class="input-field py-3" required placeholder="Nama sesuai KTP">
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor NIK</label>
                  <input type="text" v-model="form.renterNik" class="input-field py-3" required placeholder="Belum ada — isi di Profil">
                </div>
                <div class="space-y-2 md:col-span-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">No. WhatsApp</label>
                  <input type="tel" v-model="form.renterPhone" class="input-field py-3" required placeholder="Belum ada — isi di Profil">
                </div>
              </div>
            </div>

            <button type="submit" class="hidden" id="submitBtn"></button>
          </form>
        </div>

        <!-- Right: Snacks & Checkout Summary -->
        <div class="space-y-6">
          
          <!-- Optional: Add Snacks -->
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 class="font-bold text-navy mb-4">Tambah Snack (Opsional)</h2>
            <div v-if="mitra.snacks?.length > 0" class="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              <div v-for="snack in mitra.snacks" :key="snack.id" class="flex justify-between items-center p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <p class="font-bold text-navy text-sm">{{ snack.name }}</p>
                  <p class="text-xs text-gray-500">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                </div>
                
                <div class="flex items-center space-x-3" v-if="form.snacks.find(s => s.snackId === snack.id)">
                  <button @click="decreaseSnack(snack.id)" class="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold">-</button>
                  <span class="text-sm font-bold w-4 text-center">{{ form.snacks.find(s => s.snackId === snack.id).quantity }}</span>
                  <button @click="toggleSnack(snack)" class="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center font-bold">+</button>
                </div>
                <button v-else @click="toggleSnack(snack)" class="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                  Tambah
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Mitra ini belum menyediakan snack.</p>
          </div>

          <!-- Summary Card -->
          <div class="bg-navy rounded-3xl p-8 text-white sticky top-28 shadow-2xl">
            <h2 class="text-xl font-bold mb-6">Ringkasan Booking</h2>
            
            <div class="space-y-4 mb-6 text-sm">
              <div class="flex justify-between text-gray-300">
                <span>{{ selectedUnit.name }} x {{ form.durationHour }} Jam</span>
                <span class="text-white font-medium">Rp{{ subtotalUnit.toLocaleString() }}</span>
              </div>
              <div v-for="s in form.snacks" :key="s.snackId" class="flex justify-between text-gray-300">
                <span>{{ s.name }} (x{{ s.quantity }})</span>
                <span class="text-white font-medium">Rp{{ (s.priceAtBooking * s.quantity).toLocaleString() }}</span>
              </div>
            </div>

            <div class="border-t border-white/10 pt-4 mb-8">
              <div class="flex justify-between items-end">
                <span class="text-gray-300 font-medium">Total Bayar</span>
                <span class="text-3xl font-black text-primary-400">Rp{{ totalPrice.toLocaleString() }}</span>
              </div>
            </div>

            <button 
              @click="submitBooking"
              class="w-full btn-primary py-4 text-lg flex items-center justify-center"
              :disabled="isSubmitting"
            >
              <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="w-6 h-6 mr-2" />
              {{ isSubmitting ? 'Memproses...' : 'Buat Pesanan' }}
            </button>
            <p class="text-[10px] text-gray-400 text-center mt-4">
              Pembayaran dilakukan di lokasi mitra sebelum bermain.
            </p>
          </div>

        </div>
      </div>
    </template>
  </div>
</template>
