<script setup>
const config = useRuntimeConfig()
const { user, isLoggedIn } = useAuth()

if (!isLoggedIn.value) {
  navigateTo('/auth/login')
}

const { data: response, pending } = await useFetch(`${config.public.apiBase}/booking/user`, {
  query: { userId: user.value?.id } 
})

const bookings = computed(() => response.value?.data || [])

const getStatusClasses = (status) => {
  const map = {
    WAITING_PAYMENT: 'bg-amber-50 text-amber-600 border-amber-100',
    CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
    ONGOING: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    COMPLETED: 'bg-green-50 text-green-600 border-green-100',
    CANCELLED: 'bg-red-50 text-red-600 border-red-100',
  }
  return map[status] || 'bg-gray-50 text-gray-600 border-gray-100'
}
</script>

<template>
  <div class="p-4 md:p-10 space-y-12 bg-gray-50/30 min-h-screen">
    <!-- Header -->
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="text-4xl font-black text-navy tracking-tight">Riwayat Booking</h1>
        <p class="text-gray-500 font-medium mt-1">Pantau status penyewaan PlayStation Anda di sini.</p>
      </div>
      <div class="flex items-center bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
        <Icon name="heroicons:funnel-20-solid" class="w-5 h-5 text-gray-400 mr-3" />
        <span class="text-xs font-black uppercase tracking-widest text-navy">Semua Status</span>
      </div>
    </div>

    <div class="max-w-6xl mx-auto">
      <div v-if="pending" class="space-y-8">
        <div v-for="i in 3" :key="i" class="h-48 bg-white border border-gray-100 rounded-[40px] animate-pulse"></div>
      </div>

      <div v-else-if="bookings.length === 0" class="text-center py-32 bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Icon name="heroicons:calendar-days" class="w-12 h-12 text-gray-200" />
        </div>
        <h3 class="text-2xl font-black text-navy mb-3 tracking-tight">Belum Ada Aktivitas</h3>
        <p class="text-gray-500 font-medium mb-10 max-w-sm mx-auto">Anda belum memiliki riwayat penyewaan. Temukan rental PS terdekat dan mulai bermain!</p>
        <NuxtLink to="/" class="bg-navy text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-navy/20 hover:bg-primary-500 hover:text-navy transition-all active:scale-95 inline-flex items-center">
          Jelajahi Rental PS
          <Icon name="heroicons:arrow-right-20-solid" class="ml-2 w-5 h-5" />
        </NuxtLink>
      </div>

      <div v-else class="space-y-8">
        <div 
          v-for="booking in bookings" 
          :key="booking.id"
          class="group bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 hover:border-primary-200 hover:shadow-primary-900/10 transition-all duration-500 overflow-hidden relative"
        >
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-1000 opacity-50"></div>
          
          <div class="p-8 md:p-10 relative z-10">
            <!-- Top Section -->
            <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-8 mb-8 gap-6">
              <div class="flex items-center space-x-6">
                <div class="w-16 h-16 bg-navy rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <Icon name="heroicons:ticket-20-solid" class="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <div class="flex items-center space-x-3 mb-1">
                    <span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Booking ID</span>
                    <span class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">#BK-{{ booking.id.toString().padStart(4, '0') }}</span>
                  </div>
                  <h3 class="text-2xl font-black text-navy tracking-tight group-hover:text-primary-600 transition-colors">{{ booking.mitra?.shopName || 'Mitra PS' }}</h3>
                </div>
              </div>
              <div 
                class="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border self-start md:self-center shadow-sm"
                :class="getStatusClasses(booking.status)"
              >
                {{ booking.status.replace('_', ' ') }}
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div class="space-y-4">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit & Durasi</p>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <Icon name="heroicons:computer-desktop-20-solid" class="w-4 h-4 text-navy" />
                  </div>
                  <div>
                    <p class="font-black text-navy text-sm">{{ booking.unit?.name || 'Unit PS' }}</p>
                    <p class="text-xs font-bold text-gray-400">{{ booking.durationHour }} Jam Bermain</p>
                  </div>
                </div>
              </div>
              
              <div class="space-y-4">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu Sewa</p>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <Icon name="heroicons:clock-20-solid" class="w-4 h-4 text-navy" />
                  </div>
                  <div>
                    <p class="font-black text-navy text-sm">{{ new Date(booking.startTime).toLocaleDateString('id-ID', { dateStyle: 'medium' }) }}</p>
                    <p class="text-xs font-bold text-gray-400">{{ new Date(booking.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} WIB</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail User</p>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <Icon name="heroicons:user-20-solid" class="w-4 h-4 text-navy" />
                  </div>
                  <div>
                    <p class="font-black text-navy text-sm">{{ booking.renterName }}</p>
                    <p class="text-xs font-bold text-gray-400">{{ booking.renterPhone }}</p>
                  </div>
                </div>
              </div>

              <div class="md:text-right space-y-4">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bayar</p>
                <div>
                  <p class="text-3xl font-black text-navy tracking-tight">Rp{{ parseFloat(booking.totalPrice).toLocaleString() }}</p>
                  <button 
                    v-if="booking.status === 'WAITING_PAYMENT'"
                    class="mt-4 w-full md:w-auto bg-navy text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-navy transition-all shadow-lg shadow-navy/10 active:scale-95"
                  >
                    Bayar Sekarang
                  </button>
                  <button 
                    v-else
                    class="mt-4 w-full md:w-auto bg-gray-50 text-gray-400 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 cursor-default"
                  >
                    Detail Transaksi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
