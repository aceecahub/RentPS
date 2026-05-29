
<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()


// Fetch Admin Stats
const { data: statsRes, pending: statsPending } = await useFetch(`${config.public.apiBase}/mitra/admin/stats`, {
  key: 'admin-stats',
  headers: useRequestHeaders(['cookie'])
})

// Fetch Pending Mitras
const { data: pendingRes, pending: pendingLoading, refresh: refreshList } = await useFetch(`${config.public.apiBase}/mitra/admin/list`, {
  key: 'admin-pending-mitras',
  query: { status: 'PENDING' },
  headers: useRequestHeaders(['cookie'])
})

const pendingMitras = computed(() => pendingRes.value?.data || [])

const approveMitra = async (id) => {
  try {
    await $fetch(`${config.public.apiBase}/mitra/approve/${id}`, {
      method: 'PUT',
      body: { approvalStatus: 'APPROVED' }
    })
    refreshList()
  } catch (error) {
    alert('Gagal menyetujui mitra')
  }
}

const rejectMitra = async (id) => {
  const reason = prompt('Alasan penolakan:')
  if (!reason) return
  try {
    await $fetch(`${config.public.apiBase}/mitra/approve/${id}`, {
      method: 'PUT',
      body: { approvalStatus: 'REJECTED', rejectionReason: reason }
    })
    refreshList()
  } catch (error) {
    alert('Gagal menolak mitra')
  }
}

const stats = computed(() => [
  {
    label: 'Menunggu Approval',
    value: statsRes.value?.data?.pendingMitra ?? '-',
    icon: 'heroicons:clock-20-solid',
    color: 'bg-amber-500',
    trend: 'Perlu tindakan',
    trendColor: 'text-amber-500'
  },
  {
    label: 'Mitra Aktif',
    value: statsRes.value?.data?.activeMitra ?? '-',
    icon: 'heroicons:building-storefront-20-solid',
    color: 'bg-green-500',
    trend: 'Approved',
    trendColor: 'text-green-500'
  },
  {
    label: 'Total Booking',
    value: (statsRes.value?.data?.totalBookings ?? 0).toLocaleString(),
    icon: 'heroicons:calendar-days-20-solid',
    color: 'bg-primary-500',
    trend: 'All time',
    trendColor: 'text-gray-400'
  },
  {
    label: 'Total Mitra',
    value: statsRes.value?.data?.totalMitra ?? '-',
    icon: 'heroicons:user-group-20-solid',
    color: 'bg-navy',
    trend: 'Terdaftar',
    trendColor: 'text-gray-400'
  }
])
</script>

<template>
  <div class="py-8 px-4 md:px-6 space-y-8 bg-slate-50/50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-navy tracking-tight">Panel Admin</h1>
        <p class="text-slate-500 font-medium mt-1 text-sm">Selamat datang, <span class="text-navy font-bold">{{ user?.name }}</span>. Kelola seluruh platform dari sini.</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-navy text-white px-4 py-2 rounded-lg shadow-sm">
          <Icon name="heroicons:shield-check-20-solid" class="w-4 h-4 text-primary-400 mr-1.5" />
          <span class="font-bold text-xs uppercase tracking-wider">Admin Mode</span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-if="statsPending" v-for="i in 4" :key="i" class="bg-white p-5 rounded-xl border border-slate-200 animate-pulse">
        <div class="h-9 w-9 bg-slate-100 rounded-lg mb-4"></div>
        <div class="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
        <div class="h-6 bg-slate-100 rounded w-3/4"></div>
      </div>
      <div v-else v-for="stat in stats" :key="stat.label" class="group bg-white p-5 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between mb-4">
          <div :class="[stat.color, 'w-9 h-9 rounded-lg flex items-center justify-center shadow-sm']">
            <Icon :name="stat.icon" class="w-5 h-5 text-white" />
          </div>
          <span :class="[stat.trendColor, 'text-[9px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-0.5 rounded']">
            {{ stat.trend }}
          </span>
        </div>
        <p class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{{ stat.label }}</p>
        <p class="text-2xl font-black text-navy mt-1 tracking-tight">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Quick Nav Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NuxtLink to="/admin/dashboard/mitras" class="group bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 p-5 hover:border-primary-300 transition-all">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-navy rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <Icon name="heroicons:building-storefront-20-solid" class="w-5 h-5 text-primary-400" />
          </div>
          <div class="flex-grow">
            <h2 class="text-base font-bold text-navy tracking-tight">Kelola Mitra</h2>
            <p class="text-slate-500 font-medium mt-1 text-sm leading-relaxed">Lihat semua mitra, detail profil, unit PS, snack, foto, dan jam operasional.</p>
          </div>
        </div>
        <div class="flex items-center mt-4 text-primary-600 group-hover:text-primary-700 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
          Buka Halaman
          <Icon name="heroicons:arrow-right-20-solid" class="ml-1.5 w-4 h-4" />
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/dashboard/users" class="group bg-navy rounded-xl border border-navy shadow-lg shadow-navy/20 p-5 hover:bg-navy/90 transition-all">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
            <Icon name="heroicons:users-20-solid" class="w-5 h-5 text-primary-400" />
          </div>
          <div class="flex-grow">
            <h2 class="text-base font-bold text-white tracking-tight">Kelola User</h2>
            <p class="text-white/60 font-medium mt-1 text-sm leading-relaxed">Lihat daftar pengguna, profil lengkap, data NIK, dan riwayat transaksi mereka.</p>
          </div>
        </div>
        <div class="flex items-center mt-4 text-primary-400 group-hover:text-white font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-all">
          Buka Halaman
          <Icon name="heroicons:arrow-right-20-solid" class="ml-1.5 w-4 h-4" />
        </div>
      </NuxtLink>
    </div>

    <!-- Pending Approval Section -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div class="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="flex items-center space-x-2.5">
          <div class="w-1 h-6 bg-amber-500 rounded"></div>
          <h2 class="text-base font-bold text-navy tracking-tight">Pendaftaran Menunggu</h2>
        </div>
        <span class="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
          {{ pendingMitras.length }} Pending
        </span>
      </div>

      <div v-if="pendingLoading" class="p-12 text-center flex flex-col items-center">
        <Icon name="svg-spinners:ring-resize" class="w-7 h-7 text-primary-500 mb-3" />
        <p class="text-slate-400 font-bold uppercase tracking-wider text-xs">Memuat data pendaftaran...</p>
      </div>

      <div v-else-if="pendingMitras.length > 0" class="divide-y divide-slate-100">
        <div v-for="mitra in pendingMitras" :key="mitra.id" class="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-amber-50/20 transition-colors gap-4">
          <div class="flex items-center space-x-3.5">
            <div class="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img v-if="mitra.photos?.find(p => p.isMain)?.photoUrl" :src="mitra.photos.find(p => p.isMain).photoUrl" class="w-full h-full object-cover" />
              <Icon v-else name="heroicons:building-storefront-20-solid" class="w-5 h-5 text-slate-300" />
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-bold text-navy tracking-tight truncate">{{ mitra.shopName }}</h3>
              <p class="text-xs font-medium text-slate-500 mt-0.5">{{ mitra.user?.name }} · {{ mitra.user?.email }}</p>
              <div class="flex items-center text-xs text-slate-400 font-medium mt-0.5">
                <Icon name="heroicons:map-pin-20-solid" class="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span class="truncate max-w-[200px] md:max-w-[300px]">{{ mitra.address }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <NuxtLink :to="`/admin/dashboard/mitras`" class="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-slate-100 transition-colors">
              Detail
            </NuxtLink>
            <button
              @click="rejectMitra(mitra.id)"
              class="px-3 py-1.5 border border-red-100 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
            >
              Tolak
            </button>
            <button
              @click="approveMitra(mitra.id)"
              class="px-4 py-1.5 bg-navy text-white hover:bg-primary-600 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-sm transition-colors active:scale-95"
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      <div v-else class="p-14 text-center">
        <div class="w-14 h-14 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:check-badge-20-solid" class="w-7 h-7 text-green-400" />
        </div>
        <h3 class="text-base font-bold text-navy mb-1.5 tracking-tight">Semua Sudah Diproses</h3>
        <p class="text-slate-400 font-medium text-sm">Tidak ada pendaftaran mitra yang menunggu persetujuan saat ini.</p>
      </div>
    </div>
  </div>
</template>
