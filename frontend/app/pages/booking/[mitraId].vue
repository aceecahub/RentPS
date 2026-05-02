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
  <div class="min-h-screen bg-gray-50/50 pb-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="pending" class="text-center py-32 animate-pulse">
        <div class="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div class="h-8 w-64 bg-gray-200 rounded-2xl mx-auto"></div>
      </div>

      <div v-else-if="!selectedUnit" class="text-center py-32 bg-white rounded-[40px] border border-gray-100 shadow-xl">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:exclamation-triangle" class="w-10 h-10 text-red-500" />
        </div>
        <h3 class="text-2xl font-black text-navy">Unit Tidak Ditemukan</h3>
        <p class="text-gray-500 mt-2">Maaf, unit yang anda cari tidak tersedia di mitra ini.</p>
        <NuxtLink :to="`/mitra/${mitraId}`" class="mt-8 inline-block bg-navy text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-primary-600 transition-all">
          Kembali ke Katalog
        </NuxtLink>
      </div>

      <template v-else>
        <div class="mb-12 space-y-4">
          <NuxtLink :to="`/mitra/${mitraId}`" class="inline-flex items-center text-sm font-black uppercase tracking-widest text-primary-500 hover:text-navy transition-colors">
            <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
            Kembali ke Detail Mitra
          </NuxtLink>
          <h1 class="text-5xl font-black text-navy tracking-tight">Selesaikan Booking Anda</h1>
          <p class="text-gray-500 font-medium text-lg">Anda akan membooking unit di <span class="text-navy font-black underline decoration-primary-500 decoration-4 underline-offset-4">{{ mitra.shopName }}</span></p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <!-- Left: Form Input -->
          <div class="lg:col-span-2 space-y-10">
            
            <div v-if="errorMsg" class="p-6 bg-red-50 text-red-600 rounded-[32px] border border-red-100 flex items-center animate-shake">
              <Icon name="heroicons:exclamation-circle-20-solid" class="w-8 h-8 mr-4 shrink-0" />
              <p class="font-bold text-lg leading-tight">{{ errorMsg }}</p>
            </div>

            <!-- Unit Info Card -->
            <div class="bg-navy rounded-[40px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-navy/20 relative overflow-hidden group">
              <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-700"></div>
              
              <div class="flex items-center space-x-6 relative z-10">
                <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Icon :name="selectedUnit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-10 h-10 text-primary-400" />
                </div>
                <div>
                  <p class="text-primary-400 font-black uppercase text-[10px] tracking-widest mb-1">{{ selectedUnit.type }} Console</p>
                  <h3 class="font-black text-white text-3xl leading-none">{{ selectedUnit.name }}</h3>
                  <p class="text-primary-100/60 font-bold mt-2">Rp{{ parseFloat(selectedUnit.pricePerHour).toLocaleString() }} <span class="text-[10px] opacity-50 uppercase tracking-widest">/ jam</span></p>
                </div>
              </div>
              <div class="bg-primary-500 text-navy px-6 py-3 rounded-2xl font-black text-sm relative z-10 shadow-lg shadow-primary-500/20">
                Unit Terpilih
              </div>
            </div>

            <form @submit.prevent="submitBooking" class="space-y-10">
              <!-- Time Selection -->
              <div class="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div class="flex items-center space-x-4 mb-10">
                  <div class="w-1.5 h-8 bg-primary-500 rounded-full"></div>
                  <h2 class="text-2xl font-black text-navy tracking-tight">Atur Jadwal Bermain</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div class="space-y-3">
                    <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Tanggal</label>
                    <input type="date" v-model="form.date" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                  </div>
                  <div class="space-y-3">
                    <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jam Mulai</label>
                    <input type="time" v-model="form.startTime" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                  </div>
                  <div class="space-y-3">
                    <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Durasi (Jam)</label>
                    <div class="relative">
                      <input type="number" min="1" max="12" v-model="form.durationHour" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                      <span class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm uppercase">Jam</span>
                    </div>
                  </div>
                </div>

                <!-- Schedule Checker Info -->
                <div class="mt-12 p-8 bg-gray-50 rounded-[32px] border border-gray-100 relative overflow-hidden group">
                  <Icon name="heroicons:calendar-days-20-solid" class="absolute -right-4 -bottom-4 w-32 h-32 text-navy/[0.03] group-hover:scale-110 transition-transform" />
                  
                  <h3 class="text-sm font-black text-navy mb-6 flex items-center uppercase tracking-widest">
                    <Icon name="heroicons:clock-20-solid" class="w-5 h-5 mr-3 text-primary-500" />
                    Status Jadwal: {{ new Date(form.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) }}
                  </h3>
                  
                  <div v-if="schedulePending" class="animate-pulse space-y-3">
                    <div class="h-10 bg-gray-200 rounded-xl w-full"></div>
                  </div>
                  <div v-else-if="unitSchedules.length === 0" class="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-green-100">
                    <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <Icon name="heroicons:check-circle-20-solid" class="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p class="font-black text-green-700 text-sm">Unit Tersedia Sepenuhnya!</p>
                      <p class="text-green-600/70 text-xs font-medium mt-0.5">Belum ada booking lain di tanggal terpilih.</p>
                    </div>
                  </div>
                  <div v-else class="space-y-3">
                    <p class="text-xs font-black text-red-400 uppercase tracking-widest mb-2 pl-1">Jadwal Terisi:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div v-for="sched in unitSchedules" :key="sched.id" class="flex justify-between items-center p-4 bg-white border border-red-50 rounded-2xl shadow-sm">
                        <span class="font-black text-navy text-sm">
                          {{ new Date(sched.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} - 
                          {{ new Date(sched.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                        </span>
                        <span class="text-[9px] font-black tracking-widest uppercase px-2 py-1 bg-red-100 text-red-700 rounded-lg">Reserved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Identity Input -->
              <div class="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-1.5 h-8 bg-primary-500 rounded-full"></div>
                    <h2 class="text-2xl font-black text-navy tracking-tight">Data Verifikasi Penyewa</h2>
                  </div>
                  <div v-if="form.renterNik && form.renterPhone" class="flex items-center text-[10px] font-black uppercase tracking-[0.15em] text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 self-start">
                    <Icon name="heroicons:shield-check-20-solid" class="w-4 h-4 mr-2" />
                    Terisi Otomatis
                  </div>
                  <NuxtLink v-else to="/user/profile" class="text-xs font-black text-primary-500 hover:text-navy transition-colors flex items-center group">
                    <span>Lengkapi di Profil</span>
                    <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </NuxtLink>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap (KTP)</label>
                    <input type="text" v-model="form.renterName" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                  </div>
                  <div class="space-y-3">
                    <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nomor NIK (16 Digit)</label>
                    <input type="text" v-model="form.renterNik" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                  </div>
                  <div class="space-y-3 md:col-span-2">
                    <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Aktif</label>
                    <div class="relative">
                      <Icon name="heroicons:phone-20-solid" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                      <input type="tel" v-model="form.renterPhone" class="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-14 pr-6 py-4 text-navy font-black focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner" required>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Right: Snacks & Checkout Summary -->
          <div class="space-y-8 sticky top-28">
            
            <!-- Optional: Add Snacks -->
            <div class="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
              <div class="flex items-center space-x-3 mb-8">
                <Icon name="heroicons:sparkles-20-solid" class="text-orange-400 w-6 h-6" />
                <h2 class="font-black text-navy text-xl">Lengkapi Camilan</h2>
              </div>
              <div v-if="mitra.snacks?.length > 0" class="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <div v-for="snack in mitra.snacks" :key="snack.id" class="group flex justify-between items-center p-4 bg-gray-50/50 border border-transparent rounded-3xl hover:bg-white hover:border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div class="space-y-1">
                    <p class="font-black text-navy text-sm leading-none group-hover:text-primary-500 transition-colors">{{ snack.name }}</p>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                  </div>
                  
                  <div class="flex items-center space-x-3 bg-white p-1 rounded-2xl shadow-sm border border-gray-100" v-if="form.snacks.find(s => s.snackId === snack.id)">
                    <button @click="decreaseSnack(snack.id)" class="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black hover:bg-red-100 transition-colors">-</button>
                    <span class="text-sm font-black w-4 text-center text-navy">{{ form.snacks.find(s => s.snackId === snack.id).quantity }}</span>
                    <button @click="toggleSnack(snack)" class="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-black hover:bg-primary-100 transition-colors">+</button>
                  </div>
                  <button v-else @click="toggleSnack(snack)" class="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-navy hover:bg-navy hover:text-white hover:border-navy transition-all shadow-sm">
                    <Icon name="heroicons:plus-20-solid" class="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-10 px-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Icon name="heroicons:shopping-bag" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Menu snack belum tersedia</p>
              </div>
            </div>

            <!-- Summary Card -->
            <div class="bg-navy rounded-[48px] p-10 text-white shadow-2xl shadow-navy/30 relative overflow-hidden group">
              <div class="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 blur-[80px] rounded-full"></div>
              
              <h2 class="text-2xl font-black mb-10 tracking-tight flex items-center">
                <Icon name="heroicons:receipt-percent-20-solid" class="w-7 h-7 mr-3 text-primary-500" />
                Total Pembayaran
              </h2>
              
              <div class="space-y-6 mb-10 relative z-10">
                <div class="flex justify-between items-center group/row">
                  <span class="text-primary-100/60 font-bold text-sm tracking-wide">{{ selectedUnit.name }} <br> <span class="text-[10px] opacity-50 uppercase">{{ form.durationHour }} Jam Bermain</span></span>
                  <span class="text-white font-black text-lg">Rp{{ subtotalUnit.toLocaleString() }}</span>
                </div>
                <div v-for="s in form.snacks" :key="s.snackId" class="flex justify-between items-center animate-fade-in">
                  <span class="text-primary-100/60 font-bold text-sm tracking-wide">{{ s.name }} <br> <span class="text-[10px] opacity-50 uppercase">x{{ s.quantity }} Item</span></span>
                  <span class="text-white font-black text-lg">Rp{{ (s.priceAtBooking * s.quantity).toLocaleString() }}</span>
                </div>
              </div>

              <div class="border-t border-white/10 pt-8 mb-10 relative z-10">
                <div class="flex flex-col gap-2">
                  <span class="text-primary-100/40 font-black uppercase tracking-[0.2em] text-[10px]">Total yang harus dibayar</span>
                  <span class="text-5xl font-black text-primary-500 tracking-tighter">Rp{{ totalPrice.toLocaleString() }}</span>
                </div>
              </div>

              <button 
                @click="submitBooking"
                class="w-full bg-primary-500 hover:bg-primary-400 text-navy py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-primary-500/20 active:scale-95 flex items-center justify-center relative z-10"
                :disabled="isSubmitting"
              >
                <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="w-7 h-7 mr-3" />
                {{ isSubmitting ? 'Mengirim Pesanan...' : 'Booking Sekarang' }}
              </button>
              
              <div class="mt-8 flex items-center justify-center space-x-2 text-primary-100/30">
                <Icon name="heroicons:lock-closed-20-solid" class="w-4 h-4" />
                <p class="text-[10px] font-black uppercase tracking-widest leading-none">Secure Transaction</p>
              </div>
            </div>

          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-200 rounded-full;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out infinite;
  animation-iteration-count: 2;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
