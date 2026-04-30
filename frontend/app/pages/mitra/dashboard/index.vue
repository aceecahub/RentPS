<script setup>
const { user } = useAuth()
const config = useRuntimeConfig()

// Fetch Dashboard Stats
const { data: statsRes, pending: statsPending } = await useFetch(`${config.public.apiBase}/mitra/stats`, {
  query: { userId: user.value?.id }
})

// Fetch Recent Bookings
const { data: bookingsRes, pending: bookingsPending } = await useFetch(`${config.public.apiBase}/booking/mitra`, {
  method: 'GET',
  // In a real app, userId should be extracted from token in backend
  // But for now we pass it or the backend handles it via middleware
  query: { userId: user.value?.id } 
})

const stats = computed(() => [
  { name: 'Total Booking', value: statsRes.value?.data?.totalBookings || '0', icon: 'heroicons:calendar-days' },
  { name: 'Pendapatan', value: `Rp${(statsRes.value?.data?.totalRevenue || 0).toLocaleString()}`, icon: 'heroicons:banknotes' },
  { name: 'Unit Aktif', value: statsRes.value?.data?.activeUnits || '0/0', icon: 'heroicons:computer-desktop' },
  { name: 'Status Akun', value: statsRes.value?.data?.approvalStatus || 'PENDING', icon: 'heroicons:shield-check' },
])

const recentBookings = computed(() => {
  return (bookingsRes.value?.data || []).slice(0, 5).map(b => ({
    id: `#BK-${b.id.toString().padStart(3, '0')}`,
    customer: b.user?.name || 'Pelanggan',
    unit: b.unit?.name || 'Unit PS',
    time: `${b.startTime} - ${b.endTime}`,
    status: b.status
  }))
})
</script>

<template>
  <div class="p-8 space-y-10">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-navy">Dashboard Mitra</h1>
        <p class="text-gray-500">Selamat datang kembali, {{ user?.name }}!</p>
      </div>
      <div class="flex space-x-3">
        <nuxt-link to="/mitra/dashboard/store">
          <button class="btn-outline flex items-center">
            <Icon name="heroicons:cog-6-tooth" class="mr-2 w-5 h-5" />
            Pengaturan Toko
          </button>
        </nuxt-link>
        <button class="btn-primary flex items-center">
          <Icon name="heroicons:plus" class="mr-2 w-5 h-5" />
          Tambah Unit PS
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-if="statsPending" v-for="i in 4" :key="i" class="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse">
        <div class="h-10 w-10 bg-gray-100 rounded-xl mb-4"></div>
        <div class="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
        <div class="h-8 bg-gray-100 rounded w-3/4"></div>
      </div>
      <div v-else v-for="stat in stats" :key="stat.name" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-gray-50 rounded-xl">
            <Icon :name="stat.icon" class="w-6 h-6 text-navy" />
          </div>
          <span v-if="stat.name === 'Total Booking'" class="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">+0%</span>
        </div>
        <p class="text-gray-500 text-sm font-medium">{{ stat.name }}</p>
        <p class="text-2xl font-black text-navy mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Bookings Table -->
      <div class="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 class="text-xl font-bold text-navy">Booking Terbaru</h2>
          <NuxtLink to="/mitra/dashboard/bookings" class="text-primary-600 text-sm font-bold hover:underline">Lihat Semua</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <div v-if="bookingsPending" class="p-10 text-center text-gray-400">Memuat data...</div>
          <div v-else-if="recentBookings.length === 0" class="p-20 text-center">
            <Icon name="heroicons:calendar" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p class="text-gray-500 font-medium">Belum ada booking masuk</p>
          </div>
          <table v-else class="w-full text-left">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th class="px-6 py-4 font-bold">ID Booking</th>
                <th class="px-6 py-4 font-bold">Pelanggan</th>
                <th class="px-6 py-4 font-bold">Unit</th>
                <th class="px-6 py-4 font-bold">Waktu</th>
                <th class="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="booking in recentBookings" :key="booking.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-bold text-navy text-sm">{{ booking.id }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ booking.customer }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 font-medium">{{ booking.unit }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ booking.time }}</td>
                <td class="px-6 py-4">
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
                    :class="{
                      'bg-blue-100 text-blue-700': booking.status === 'ONGOING',
                      'bg-orange-100 text-orange-700': booking.status === 'PENDING' || booking.status === 'CONFIRMED',
                      'bg-green-100 text-green-700': booking.status === 'COMPLETED',
                      'bg-red-100 text-red-700': booking.status === 'CANCELLED'
                    }"
                  >
                    {{ booking.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions / Snack Inventory -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h2 class="text-xl font-bold text-navy mb-6">Manajemen Cepat</h2>
        <div class="space-y-4">
          <NuxtLink to="/mitra/dashboard/bookings" class="w-full flex items-center justify-between p-4 bg-orange-50 rounded-2xl hover:bg-orange-500 hover:text-white transition-all group text-left">
            <div class="flex items-center">
              <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 mr-3 text-orange-500 group-hover:text-white" />
              <span class="font-bold text-orange-900 group-hover:text-white">Kelola Pesanan Masuk</span>
            </div>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100" />
          </NuxtLink>
          <!-- <NuxtLink to="/mitra/dashboard/store" class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-navy hover:text-white transition-all group text-left">
            <div class="flex items-center">
              <Icon name="heroicons:computer-desktop" class="w-5 h-5 mr-3" />
              <span class="font-bold">Kelola Unit PS</span>
            </div>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100" />
          </NuxtLink>
          <NuxtLink to="/mitra/dashboard/store" class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-navy hover:text-white transition-all group text-left">
            <div class="flex items-center">
              <Icon name="heroicons:cake" class="w-5 h-5 mr-3" />
              <span class="font-bold">Update Stok Snack</span>
            </div>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100" />
          </NuxtLink> -->
        </div>

        <div class="mt-10 bg-navy rounded-2xl p-6 text-white overflow-hidden relative">
          <Icon name="heroicons:shield-check" class="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
          <p class="text-sm font-medium text-gray-400 mb-1">Status Verifikasi</p>
          <p class="text-xl font-black mb-4 uppercase">{{ statsRes?.data?.approvalStatus || 'PENDING' }}</p>
          <div class="h-1 bg-white/20 rounded-full overflow-hidden">
            <div class="h-full bg-primary-400" :style="{ width: statsRes?.data?.approvalStatus === 'APPROVED' ? '100%' : '50%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
