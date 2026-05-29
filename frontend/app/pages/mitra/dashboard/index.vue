<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()


// Fetch Dashboard Stats
const { data: statsRes, pending: statsPending } = await useFetch(`${config.public.apiBase}/mitra/stats`, {
  key: 'mitra-stats',
  query: computed(() => ({ userId: user.value?.id })),
  headers: useRequestHeaders(['cookie']),
  watch: [user]
})

// Fetch Recent Bookings
const { data: bookingsRes, pending: bookingsPending } = await useFetch(`${config.public.apiBase}/booking/mitra`, {
  key: 'mitra-recent-bookings',
  method: 'GET',
  query: computed(() => ({ userId: user.value?.id })),
  headers: useRequestHeaders(['cookie']),
  watch: [user]
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
  <div class="py-10 px-4 md:px-6 space-y-10 bg-slate-50/50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Dashboard Utama</h1>
        <p class="text-slate-500 text-sm font-medium mt-1">Selamat datang kembali, <span class="text-navy font-bold">{{ user?.name }}</span></p>
      </div>
      <div class="flex items-center space-x-3">
        <NuxtLink to="/mitra/dashboard/store" class="bg-white border border-slate-200 text-navy px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors flex items-center shadow-sm">
          <Icon name="heroicons:cog-6-tooth-20-solid" class="mr-2 w-4.5 h-4.5 text-slate-400" />
          Pengaturan Toko
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-if="statsPending" v-for="i in 4" :key="i" class="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
        <div class="h-12 w-12 bg-slate-100 rounded-lg mb-4"></div>
        <div class="h-4 bg-slate-100 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-slate-100 rounded w-3/4"></div>
      </div>
      
      <div v-else v-for="stat in stats" :key="stat.name" class="group bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 transition-all hover:shadow-md relative overflow-hidden">
        <div class="flex items-center justify-between mb-6 relative z-10">
          <div :class="[stat.color, 'w-12 h-12 rounded-lg flex items-center justify-center shadow-sm']">
            <Icon :name="stat.icon" class="w-6 h-6 text-white" />
          </div>
          <span :class="[stat.trendColor, 'text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-150 px-2 py-0.5 rounded']">
            {{ stat.trend }}
          </span>
        </div>
        <div class="relative z-10">
          <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">{{ stat.name }}</p>
          <p class="text-2xl font-black text-navy mt-1 tracking-tight">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Bookings Table -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div class="flex items-center space-x-2.5">
            <div class="w-1 h-6 bg-primary-500 rounded"></div>
            <h2 class="text-lg font-bold text-navy">Booking Terbaru</h2>
          </div>
          <NuxtLink to="/mitra/dashboard/bookings" class="text-primary-600 text-xs font-bold uppercase tracking-wider hover:text-navy transition-colors">Lihat Semua</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <div v-if="bookingsPending" class="p-16 text-center flex flex-col items-center">
            <Icon name="svg-spinners:ring-resize" class="w-10 h-10 text-primary-500 mb-3" />
            <p class="text-slate-400 font-bold uppercase tracking-wider text-xs">Menyelaraskan data...</p>
          </div>
          <div class="p-20 text-center" v-else-if="recentBookings.length === 0">
            <div class="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Icon name="heroicons:calendar" class="w-8 h-8 text-slate-300" />
            </div>
            <p class="text-navy font-bold text-base">Belum ada aktivitas booking</p>
            <p class="text-slate-500 text-sm mt-1">Pastikan unit Anda dalam status tersedia.</p>
          </div>
          <table v-else class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-150">
                <th class="px-6 py-3.5 font-bold">ID Booking</th>
                <th class="px-6 py-3.5 font-bold">Pelanggan</th>
                <th class="px-6 py-3.5 font-bold">Unit</th>
                <th class="px-6 py-3.5 font-bold">Status</th>
                <th class="px-6 py-3.5 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="booking in recentBookings" :key="booking.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4">
                  <span class="font-bold text-navy text-sm">{{ booking.id }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2.5">
                    <div class="w-7 h-7 bg-navy rounded flex items-center justify-center text-[10px] font-bold text-white">
                      {{ booking.customer.charAt(0) }}
                    </div>
                    <span class="text-sm font-bold text-slate-700">{{ booking.customer }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-500 font-medium">{{ booking.unit }}</span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border"
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
                <td class="px-6 py-4">
                  <button class="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors border border-transparent">
                    <Icon name="heroicons:eye-20-solid" class="w-4 h-4" />
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
        <div class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6">
          <h2 class="text-lg font-bold text-navy mb-6 tracking-tight flex items-center">
            <Icon name="heroicons:rocket-launch-20-solid" class="mr-2 text-primary-500 w-5 h-5" />
            Quick Access
          </h2>
          <div class="space-y-3.5">
            <NuxtLink to="/mitra/dashboard/bookings" class="flex items-center justify-between p-4 bg-navy text-white rounded-lg hover:bg-navy-600 transition-all group shadow-sm">
              <div class="flex items-center">
                <Icon name="heroicons:clipboard-document-list-20-solid" class="w-5 h-5 mr-3 group-hover:scale-105 transition-transform" />
                <span class="font-bold text-xs uppercase tracking-wider">Kelola Pesanan</span>
              </div>
              <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4 opacity-70 group-hover:opacity-100 transition-all" />
            </NuxtLink>

            <NuxtLink to="/mitra/dashboard/income" class="flex items-center justify-between p-4 bg-slate-50 text-navy rounded-lg hover:bg-white hover:shadow transition-all group border border-slate-100 hover:border-slate-200">
              <div class="flex items-center">
                <Icon name="heroicons:banknotes-20-solid" class="w-5 h-5 mr-3 text-slate-400 group-hover:text-primary-500" />
                <span class="font-bold text-xs uppercase tracking-wider">Laporan Pendapatan</span>
              </div>
              <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4 opacity-70 group-hover:opacity-100 transition-all" />
            </NuxtLink>

            <NuxtLink to="/mitra/dashboard/inbox" class="flex items-center justify-between p-4 bg-slate-50 text-navy rounded-lg hover:bg-white hover:shadow transition-all group border border-slate-100 hover:border-slate-200">
              <div class="flex items-center">
                <Icon name="heroicons:chat-bubble-oval-left-ellipsis-20-solid" class="w-5 h-5 mr-3 text-slate-400 group-hover:text-primary-500" />
                <span class="font-bold text-xs uppercase tracking-wider">Inbox Pesan</span>
              </div>
              <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4 opacity-70 group-hover:opacity-100 transition-all" />
            </NuxtLink>
          </div>
        </div>

        <!-- Verification Status Card -->
        <div class="rounded-xl p-6 text-white overflow-hidden relative shadow-md transition-all group"
          :class="statsRes?.data?.approvalStatus === 'REJECTED' ? 'bg-red-600' : 'bg-navy'">
          <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-all"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-6">
              <p class="text-[10px] font-bold uppercase tracking-wider text-white/40">Status Verifikasi</p>
              <Icon :name="statsRes?.data?.approvalStatus === 'APPROVED' ? 'heroicons:shield-check-20-solid' : 'heroicons:shield-exclamation-20-solid'" class="w-5 h-5 text-primary-500" />
            </div>
            
            <div class="space-y-1.5 mb-6">
              <p class="text-2xl font-black uppercase tracking-tight">{{ statsRes?.data?.approvalStatus || 'PENDING' }}</p>
              
              <!-- Message based on status -->
              <p v-if="statsRes?.data?.approvalStatus === 'APPROVED'" class="text-xs font-medium text-primary-100/60 leading-relaxed">
                Selamat! Akun Anda telah diverifikasi penuh oleh tim RentPS.
              </p>
              <p v-else-if="statsRes?.data?.approvalStatus === 'REJECTED'" class="text-xs font-medium text-white/80 leading-relaxed">
                <span class="block font-bold text-white mb-1.5 underline decoration-white/30 underline-offset-4">Alasan Penolakan:</span>
                "{{ statsRes?.data?.rejectionReason }}"
                <span class="block mt-3 text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/10 p-2.5 rounded border border-white/10">
                  Mohon perbaiki data Anda di Pengaturan Toko agar dapat ditinjau kembali.
                </span>
              </p>
              <p v-else class="text-xs font-medium text-primary-100/60 leading-relaxed">
                Mohon tunggu, tim kami sedang memvalidasi data toko Anda.
              </p>
            </div>

            <div class="h-1.5 bg-white/10 rounded overflow-hidden">
              <div 
                class="h-full transition-all duration-1000" 
                :class="statsRes?.data?.approvalStatus === 'APPROVED' ? 'bg-primary-500' : (statsRes?.data?.approvalStatus === 'REJECTED' ? 'bg-white' : 'bg-primary-500/50')"
                :style="{ width: statsRes?.data?.approvalStatus === 'APPROVED' ? '100%' : (statsRes?.data?.approvalStatus === 'REJECTED' ? '100%' : '40%') }"
              ></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>
