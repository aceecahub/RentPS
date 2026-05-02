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
  query: { userId: user.value?.id } 
})

const stats = computed(() => [
  { 
    name: 'Total Booking', 
    value: statsRes.value?.data?.totalBookings || '0', 
    icon: 'heroicons:calendar-days-20-solid',
    color: 'bg-blue-500',
    trend: '+12%',
    trendColor: 'text-green-500'
  },
  { 
    name: 'Pendapatan', 
    value: `Rp${(statsRes.value?.data?.totalRevenue || 0).toLocaleString()}`, 
    icon: 'heroicons:banknotes-20-solid',
    color: 'bg-green-500',
    trend: '+8%',
    trendColor: 'text-green-500'
  },
  { 
    name: 'Unit Aktif', 
    value: statsRes.value?.data?.activeUnits || '0/0', 
    icon: 'heroicons:computer-desktop-20-solid',
    color: 'bg-primary-500',
    trend: 'Stable',
    trendColor: 'text-gray-400'
  },
  { 
    name: 'Status Akun', 
    value: statsRes.value?.data?.approvalStatus || 'PENDING', 
    icon: 'heroicons:shield-check-20-solid',
    color: 'bg-navy',
    trend: 'Verified',
    trendColor: 'text-primary-500'
  },
])

const recentBookings = computed(() => {
  return (bookingsRes.value?.data || []).slice(0, 5).map(b => ({
    id: `#BK-${b.id.toString().padStart(3, '0')}`,
    customer: b.user?.name || 'Pelanggan',
    unit: b.unit?.name || 'Unit PS',
    time: `${b.startTime} - ${b.endTime}`,
    status: b.status,
    rawDate: b.startTime
  }))
})
</script>

<template>
  <div class="p-4 md:p-10 space-y-12 bg-gray-50/30 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="text-4xl font-black text-navy tracking-tight">Dashboard Utama</h1>
        <p class="text-gray-500 font-medium mt-1">Selamat datang kembali, <span class="text-navy font-bold">{{ user?.name }}</span></p>
      </div>
      <div class="flex items-center space-x-3">
        <NuxtLink to="/mitra/dashboard/store" class="bg-white border-2 border-gray-100 text-navy px-6 py-3 rounded-2xl font-black text-sm hover:border-navy transition-all flex items-center shadow-sm">
          <Icon name="heroicons:cog-6-tooth-20-solid" class="mr-2 w-5 h-5 text-gray-400" />
          Pengaturan Toko
        </NuxtLink>
        <button class="bg-navy text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-primary-500 hover:text-navy transition-all shadow-lg shadow-navy/10 flex items-center">
          <Icon name="heroicons:plus-20-solid" class="mr-2 w-5 h-5" />
          Tambah Unit
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div v-if="statsPending" v-for="i in 4" :key="i" class="bg-white p-8 rounded-[32px] border border-gray-100 animate-pulse">
        <div class="h-14 w-14 bg-gray-100 rounded-2xl mb-6"></div>
        <div class="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-gray-100 rounded w-3/4"></div>
      </div>
      <div v-else v-for="stat in stats" :key="stat.name" class="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-navy/5 transition-all hover:-translate-y-1 hover:shadow-navy/10 relative overflow-hidden">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        
        <div class="flex items-center justify-between mb-8 relative z-10">
          <div :class="[stat.color, 'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:rotate-12 transition-transform']">
            <Icon :name="stat.icon" class="w-7 h-7 text-white" />
          </div>
          <span :class="[stat.trendColor, 'text-[10px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full']">
            {{ stat.trend }}
          </span>
        </div>
        <div class="relative z-10">
          <p class="text-gray-400 text-xs font-black uppercase tracking-[0.15em]">{{ stat.name }}</p>
          <p class="text-3xl font-black text-navy mt-2 tracking-tight">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Recent Bookings Table -->
      <div class="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
            <h2 class="text-2xl font-black text-navy tracking-tight">Booking Terbaru</h2>
          </div>
          <NuxtLink to="/mitra/dashboard/bookings" class="text-primary-600 text-xs font-black uppercase tracking-widest hover:text-navy transition-colors">Lihat Semua</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <div v-if="bookingsPending" class="p-20 text-center flex flex-col items-center">
            <Icon name="svg-spinners:ring-resize" class="w-12 h-12 text-primary-500 mb-4" />
            <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Menyelaraskan data...</p>
          </div>
          <div v-else-if="recentBookings.length === 0" class="p-24 text-center">
            <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:calendar" class="w-12 h-12 text-gray-200" />
            </div>
            <p class="text-gray-500 font-bold text-lg">Belum ada aktivitas booking</p>
            <p class="text-gray-400 text-sm mt-1">Pastikan unit Anda dalam status tersedia.</p>
          </div>
          <table v-else class="w-full text-left">
            <thead>
              <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                <th class="px-8 py-5 font-black">ID Booking</th>
                <th class="px-8 py-5 font-black">Pelanggan</th>
                <th class="px-8 py-5 font-black">Unit</th>
                <th class="px-8 py-5 font-black">Status</th>
                <th class="px-8 py-5 font-black">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="booking in recentBookings" :key="booking.id" class="group hover:bg-primary-50/30 transition-all">
                <td class="px-8 py-6">
                  <span class="font-black text-navy text-sm">{{ booking.id }}</span>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-navy rounded-lg flex items-center justify-center text-[10px] font-black text-white">
                      {{ booking.customer.charAt(0) }}
                    </div>
                    <span class="text-sm font-bold text-gray-700">{{ booking.customer }}</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span class="text-sm text-gray-500 font-bold">{{ booking.unit }}</span>
                </td>
                <td class="px-8 py-6">
                  <span 
                    class="px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border"
                    :class="{
                      'bg-blue-50 text-blue-600 border-blue-100': booking.status === 'ONGOING',
                      'bg-orange-50 text-orange-600 border-orange-100': booking.status === 'PENDING' || booking.status === 'CONFIRMED',
                      'bg-green-50 text-green-600 border-green-100': booking.status === 'COMPLETED',
                      'bg-red-50 text-red-600 border-red-100': booking.status === 'CANCELLED'
                    }"
                  >
                    {{ booking.status }}
                  </span>
                </td>
                <td class="px-8 py-6">
                  <button class="p-2 text-gray-400 hover:text-navy hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100">
                    <Icon name="heroicons:eye-20-solid" class="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sidebar Actions -->
      <div class="space-y-8">
        <!-- Quick Actions Card -->
        <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 p-8">
          <h2 class="text-xl font-black text-navy mb-8 tracking-tight flex items-center">
            <Icon name="heroicons:rocket-launch-20-solid" class="mr-3 text-primary-500 w-6 h-6" />
            Quick Access
          </h2>
          <div class="space-y-4">
            <NuxtLink to="/mitra/dashboard/bookings" class="flex items-center justify-between p-5 bg-navy text-white rounded-3xl hover:bg-primary-500 hover:text-navy transition-all group shadow-xl shadow-navy/10">
              <div class="flex items-center">
                <Icon name="heroicons:clipboard-document-list-20-solid" class="w-6 h-6 mr-4 group-hover:rotate-12 transition-transform" />
                <span class="font-black text-sm uppercase tracking-widest">Kelola Pesanan</span>
              </div>
              <Icon name="heroicons:arrow-right-20-solid" class="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
            </NuxtLink>
            
            <NuxtLink to="/mitra/dashboard/store" class="flex items-center justify-between p-5 bg-gray-50 text-navy rounded-3xl hover:bg-white hover:shadow-lg transition-all group border border-transparent hover:border-gray-100">
              <div class="flex items-center">
                <Icon name="heroicons:computer-desktop-20-solid" class="w-6 h-6 mr-4 text-gray-400 group-hover:text-primary-500" />
                <span class="font-black text-sm uppercase tracking-widest">Update Unit PS</span>
              </div>
              <Icon name="heroicons:chevron-right-20-solid" class="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
            </NuxtLink>
          </div>
        </div>

        <!-- Verification Status Card -->
        <div class="bg-navy rounded-[40px] p-8 text-white overflow-hidden relative shadow-2xl shadow-navy/20 group">
          <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-primary-500/10 blur-[80px] rounded-full group-hover:bg-primary-500/20 transition-all"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-8">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-100/40">Status Verifikasi</p>
              <Icon name="heroicons:shield-check-20-solid" class="w-6 h-6 text-primary-500" />
            </div>
            
            <div class="space-y-2 mb-8">
              <p class="text-3xl font-black uppercase tracking-tighter">{{ statsRes?.data?.approvalStatus || 'PENDING' }}</p>
              <p class="text-xs font-medium text-primary-100/60 leading-relaxed">
                {{ statsRes?.data?.approvalStatus === 'APPROVED' 
                  ? 'Selamat! Akun Anda telah diverifikasi penuh oleh tim RentPS.' 
                  : 'Mohon tunggu, tim kami sedang memvalidasi data toko Anda.' 
                }}
              </p>
            </div>

            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary-500 transition-all duration-1000" 
                :style="{ width: statsRes?.data?.approvalStatus === 'APPROVED' ? '100%' : '40%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
