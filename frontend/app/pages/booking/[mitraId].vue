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
      navigateTo('/user/bookings')
    } else {
      errorMsg.value = res.message || 'Gagal membuat booking'
    }
  } catch (error) {
    errorMsg.value = error.response?._data?.message || error.message || 'Terjadi kesalahan sistem'
  } finally {
    isSubmitting.value = false
  }
}

// Scroll detection untuk navbar
const { y: scrollY } = useWindowScroll()
const isScrolled = computed(() => scrollY.value > 20)
</script>

<template>
  <div class="min-h-screen bg-white antialiased">
    
    <!-- Navbar -->
    <nav :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
      isScrolled ? 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-sm' : 'bg-white border-slate-100'
    ]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center space-x-2.5">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:gamepad-20-solid" class="w-4.5 h-4.5 text-white" />
            </div>
            <span class="text-xl font-black tracking-tight text-navy">PlaySpace</span>
          </NuxtLink>
          
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="/mitra" class="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">Cari Mitra</NuxtLink>
            <NuxtLink to="/how-it-works" class="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">Cara Kerja</NuxtLink>
            <NuxtLink to="/mitra/join" class="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">Untuk Pemilik</NuxtLink>
          </div>

          <div class="flex items-center space-x-3">
            <NuxtLink to="/auth/login" class="hidden sm:inline-flex text-sm font-bold px-4 py-2 rounded-lg text-navy hover:bg-slate-100 transition-all">Masuk</NuxtLink>
            <NuxtLink to="/auth/register" class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm">Daftar</NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      
      <!-- Loading State -->
      <div v-if="pending" class="max-w-3xl mx-auto pt-12">
        <div class="space-y-8 animate-pulse">
          <div class="h-6 bg-slate-100 rounded-lg w-48"></div>
          <div class="h-8 bg-slate-100 rounded-lg w-64"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="h-32 bg-slate-100 rounded-xl"></div>
              <div class="h-64 bg-slate-100 rounded-xl"></div>
              <div class="h-48 bg-slate-100 rounded-xl"></div>
            </div>
            <div class="h-96 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Error / Not Found -->
      <div v-else-if="!selectedUnit" class="max-w-xl mx-auto pt-16 text-center">
        <div class="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:exclamation-triangle-20-solid" class="w-8 h-8 text-red-500" />
        </div>
        <h3 class="text-2xl font-black text-red-900">Unit Tidak Ditemukan</h3>
        <p class="text-red-600/70 mt-2 text-sm font-medium">Maaf, unit yang anda cari tidak tersedia di mitra ini.</p>
        <NuxtLink :to="`/mitra/${mitraId}`" class="mt-8 inline-flex items-center space-x-2 bg-navy hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold transition-all">
          <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4" />
          <span>Kembali ke Detail Mitra</span>
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Breadcrumb & Header -->
        <div class="mb-10">
          <nav class="flex items-center space-x-2 mb-6 text-sm font-medium text-slate-400">
            <NuxtLink to="/" class="hover:text-primary-600 transition-colors">Home</NuxtLink>
            <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4" />
            <NuxtLink :to="`/mitra/${mitraId}`" class="hover:text-primary-600 transition-colors">Mitra</NuxtLink>
            <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4" />
            <span class="text-navy font-semibold">Booking</span>
          </nav>
          
          <h1 class="text-3xl lg:text-4xl font-black text-navy tracking-tight">Selesaikan Booking Anda</h1>
          <p class="text-slate-500 font-medium mt-2">
            Booking unit di <span class="text-navy font-bold">{{ mitra.shopName }}</span>
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <!-- Left: Form -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Error Message -->
            <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <Icon name="heroicons:exclamation-circle-20-solid" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm font-bold text-red-700">{{ errorMsg }}</p>
            </div>

            <!-- Selected Unit Card -->
            <div class="bg-navy rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                  <Icon :name="selectedUnit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-7 h-7 text-primary-400" />
                </div>
                <div>
                  <p class="text-primary-400 text-xs font-bold uppercase tracking-wider">{{ selectedUnit.type }}</p>
                  <h3 class="font-bold text-white text-lg">{{ selectedUnit.name }}</h3>
                  <p class="text-slate-300 text-sm font-medium">Rp{{ parseFloat(selectedUnit.pricePerHour).toLocaleString() }} / jam</p>
                </div>
              </div>
              <span class="bg-primary-500 text-navy px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">
                Unit Terpilih
              </span>
            </div>

            <!-- Schedule Form -->
            <div class="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div class="mb-6">
                <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Jadwal</span>
                <h2 class="text-xl font-black text-navy mt-1">Atur Waktu Bermain</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</label>
                  <input 
                    type="date" 
                    v-model="form.date" 
                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  >
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Mulai</label>
                  <input 
                    type="time" 
                    v-model="form.startTime" 
                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  >
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi (Jam)</label>
                  <div class="relative">
                    <input 
                      type="number" 
                      min="1" 
                      max="12" 
                      v-model="form.durationHour" 
                      class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      required
                    >
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Jam</span>
                  </div>
                </div>
              </div>

              <!-- Schedule Availability -->
              <div class="bg-slate-50 rounded-xl border border-slate-100 p-5">
                <h3 class="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                  <Icon name="heroicons:clock-20-solid" class="w-4 h-4 text-primary-500" />
                  Ketersediaan: {{ new Date(form.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                </h3>
                
                <div v-if="schedulePending" class="animate-pulse">
                  <div class="h-10 bg-slate-200 rounded-lg w-full"></div>
                </div>
                
                <div v-else-if="unitSchedules.length === 0" class="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-100">
                  <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="heroicons:check-circle-20-solid" class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-green-700">Unit tersedia sepenuhnya</p>
                    <p class="text-xs text-green-600/70 font-medium">Belum ada booking di tanggal ini</p>
                  </div>
                </div>
                
                <div v-else>
                  <p class="text-xs font-bold text-red-500 mb-3">Jadwal sudah terisi:</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div 
                      v-for="sched in unitSchedules" 
                      :key="sched.id" 
                      class="flex justify-between items-center p-3 bg-white border border-red-100 rounded-lg"
                    >
                      <span class="font-bold text-navy text-sm">
                        {{ new Date(sched.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} - 
                        {{ new Date(sched.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                      </span>
                      <span class="text-[10px] font-bold uppercase px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100">Booked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Identity Form -->
            <div class="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                  <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Verifikasi</span>
                  <h2 class="text-xl font-black text-navy mt-1">Data Penyewa</h2>
                </div>
                <div v-if="form.renterNik && form.renterPhone" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                  <Icon name="heroicons:shield-check-20-solid" class="w-4 h-4" />
                  Data tersimpan
                </div>
                <NuxtLink v-else to="/user/profile" class="text-xs font-bold text-primary-600 hover:text-navy transition-colors flex items-center gap-1">
                  Lengkapi di Profil
                  <Icon name="heroicons:arrow-right-20-solid" class="w-3.5 h-3.5" />
                </NuxtLink>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap (KTP)</label>
                  <input 
                    type="text" 
                    v-model="form.renterName" 
                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  >
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor NIK</label>
                  <input 
                    type="text" 
                    v-model="form.renterNik" 
                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    required
                  >
                </div>
                <div class="space-y-2 md:col-span-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Aktif</label>
                  <div class="relative">
                    <Icon name="heroicons:phone-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="tel" 
                      v-model="form.renterPhone" 
                      class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      required
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Summary & Snacks -->
          <div class="space-y-6 lg:sticky lg:top-24">
            
            <!-- Snacks -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div class="flex items-center gap-2 mb-5">
                <Icon name="heroicons:shopping-bag-20-solid" class="text-primary-500 w-5 h-5" />
                <h2 class="font-bold text-navy text-lg">Tambah Snack</h2>
              </div>
              
              <div v-if="mitra.snacks?.length > 0" class="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <div 
                  v-for="snack in mitra.snacks" 
                  :key="snack.id" 
                  class="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div>
                    <p class="font-bold text-navy text-sm">{{ snack.name }}</p>
                    <p class="text-xs text-slate-400 font-medium">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                  </div>
                  
                  <div v-if="form.snacks.find(s => s.snackId === snack.id)" class="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100">
                    <button 
                      @click="decreaseSnack(snack.id)" 
                      class="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm"
                    >-</button>
                    <span class="text-sm font-bold text-navy w-4 text-center">{{ form.snacks.find(s => s.snackId === snack.id).quantity }}</span>
                    <button 
                      @click="toggleSnack(snack)" 
                      class="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors text-sm"
                    >+</button>
                  </div>
                  
                  <button 
                    v-else 
                    @click="toggleSnack(snack)" 
                    class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-navy hover:text-white hover:border-navy transition-all"
                  >
                    <Icon name="heroicons:plus-20-solid" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div v-else class="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Icon name="heroicons:shopping-bag-20-solid" class="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p class="text-xs text-slate-400 font-medium">Menu snack belum tersedia</p>
              </div>
            </div>

            <!-- Total Summary -->
            <div class="bg-navy rounded-2xl p-6 text-white shadow-lg">
              <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <Icon name="heroicons:receipt-percent-20-solid" class="w-5 h-5 text-primary-400" />
                Ringkasan Pembayaran
              </h2>
              
              <div class="space-y-4 mb-6 text-sm">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-slate-300">{{ selectedUnit.name }}</p>
                    <p class="text-xs text-slate-400">{{ form.durationHour }} jam</p>
                  </div>
                  <span class="font-bold">Rp{{ subtotalUnit.toLocaleString() }}</span>
                </div>
                
                <div v-for="s in form.snacks" :key="s.snackId" class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-slate-300">{{ s.name }}</p>
                    <p class="text-xs text-slate-400">x{{ s.quantity }}</p>
                  </div>
                  <span class="font-bold">Rp{{ (s.priceAtBooking * s.quantity).toLocaleString() }}</span>
                </div>
              </div>

              <div class="border-t border-white/10 pt-5 mb-6">
                <p class="text-xs text-slate-400 font-medium mb-1">Total pembayaran</p>
                <p class="text-3xl font-black text-primary-400">Rp{{ totalPrice.toLocaleString() }}</p>
              </div>

              <button 
                @click="submitBooking"
                class="w-full bg-primary-500 hover:bg-primary-400 text-navy py-3.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              >
                <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="w-5 h-5" />
                <span>{{ isSubmitting ? 'Memproses...' : 'Konfirmasi Booking' }}</span>
              </button>
              
              <div class="mt-4 flex items-center justify-center gap-1.5 text-slate-400">
                <Icon name="heroicons:lock-closed-20-solid" class="w-3.5 h-3.5" />
                <p class="text-[10px] font-bold uppercase tracking-wider">Pembayaran terenkripsi</p>
              </div>
            </div>

            <!-- Trust Note -->
            <div class="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h4 class="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                <Icon name="heroicons:shield-check-20-solid" class="w-4 h-4 text-primary-500" />
                Jaminan Keamanan
              </h4>
              <ul class="space-y-2">
                <li class="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Refund penuh jika unit tidak tersedia</span>
                </li>
                <li class="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Data penyewa dienkripsi dan terlindungi</span>
                </li>
                <li class="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Mitra terverifikasi oleh tim PlaySpace</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 999px;
}

html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>