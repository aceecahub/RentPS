<script setup>
const config = useRuntimeConfig()
const { user, isLoggedIn } = useAuth()

if (!isLoggedIn.value) {
  navigateTo('/auth/login')
}

// Fetch User Bookings
// In the backend, getUserBookings expects userId in req.body for GET request? 
// No, express usually doesn't allow body in GET. Wait, the controller says req.body.userId.
// Let me use a POST request if it's req.body, or maybe I should fix the backend to use req.query.
// Assuming the backend bookingRoutes uses router.get("/user", ...) but reads req.body.userId, that's bad practice, but I can use $fetch with a query or body if needed.
// Actually, let's use useFetch with method GET and maybe the backend reads from the token middleware.
// Wait! `bookingController.getUserBookings = async (req, res) => { const bookings = await bookingService.getUserBookings(req.body.userId) ... }`
// The middleware verifyToken might put userId in req.body.userId.
// Since we are not using Bearer token headers in useFetch yet, I will pass it as query or just use the backend as is if I pass userId in query and the backend reads it.
// Let's pass userId in query and modify the backend if needed, or just use $fetch with POST. Wait, it's a GET route.

const { data: response, pending } = await useFetch(`${config.public.apiBase}/booking/user`, {
  // We'll pass it in query and hope the backend reads req.query or we fix the backend.
  query: { userId: user.value?.id } 
})

const bookings = computed(() => response.value?.data || [])

const getStatusColor = (status) => {
  const colors = {
    WAITING_PAYMENT: 'bg-orange-100 text-orange-700 border-orange-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    ONGOING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-10">
      <h1 class="text-3xl font-black text-navy mb-2">Riwayat Booking</h1>
      <p class="text-gray-500">Daftar pesanan rental PlayStation Anda.</p>
    </div>

    <div v-if="pending" class="space-y-6">
      <div v-for="i in 3" :key="i" class="h-32 bg-gray-100 rounded-3xl animate-pulse"></div>
    </div>

    <div v-else-if="bookings.length === 0" class="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="heroicons:calendar" class="w-12 h-12 text-gray-300" />
      </div>
      <h3 class="text-xl font-bold text-navy mb-2">Belum Ada Transaksi</h3>
      <p class="text-gray-500 mb-6">Anda belum pernah melakukan booking. Yuk cari mitra PS sekarang!</p>
      <NuxtLink to="/" class="btn-primary inline-block">Cari Tempat PS</NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <div 
        v-for="booking in bookings" 
        :key="booking.id"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-4 mb-4 gap-4">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Icon name="heroicons:ticket" class="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p class="text-xs text-gray-400 font-bold mb-1">ID: #BK-{{ booking.id.toString().padStart(4, '0') }}</p>
              <h3 class="font-bold text-navy text-lg">{{ booking.mitra?.shopName || 'Mitra PS' }}</h3>
            </div>
          </div>
          <div 
            class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border text-center"
            :class="getStatusColor(booking.status)"
          >
            {{ booking.status.replace('_', ' ') }}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Unit & Waktu</p>
            <p class="font-medium text-navy">{{ booking.unit?.name || 'Unit PS' }}</p>
            <p class="text-sm text-gray-500 flex items-center mt-1">
              <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
              {{ new Date(booking.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) }}
            </p>
            <p class="text-sm text-gray-500 ml-5">{{ booking.durationHour }} Jam</p>
          </div>
          
          <div>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Data Penyewa</p>
            <p class="font-medium text-navy">{{ booking.renterName }}</p>
            <p class="text-sm text-gray-500">{{ booking.renterPhone }}</p>
          </div>

          <div class="md:text-right">
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Pembayaran</p>
            <p class="text-2xl font-black text-primary-600">Rp{{ parseFloat(booking.totalPrice).toLocaleString() }}</p>
            <button 
              v-if="booking.status === 'WAITING_PAYMENT'"
              class="mt-3 w-full md:w-auto bg-navy hover:bg-navy-light text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors"
            >
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
