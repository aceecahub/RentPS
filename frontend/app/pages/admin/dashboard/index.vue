<script setup>
const { user } = useAuth()
const config = useRuntimeConfig()

// Fetch Admin Stats
const { data: statsRes, pending: statsPending } = await useFetch(`${config.public.apiBase}/mitra/admin/stats`)

// Fetch Pending Mitras
const { data: pendingRes, pending: pendingLoading, refresh: refreshList } = await useFetch(`${config.public.apiBase}/mitra/admin/list`, {
  query: { status: 'PENDING' }
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
  <div class="p-4 md:p-10 space-y-12 bg-gray-50/30 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="text-4xl font-black text-navy tracking-tight">Panel Admin</h1>
        <p class="text-gray-500 font-medium mt-1">Selamat datang, <span class="text-navy font-bold">{{ user?.name }}</span>. Kelola seluruh platform dari sini.</p>
      </div>
      <div class="flex items-center bg-navy text-white px-6 py-3 rounded-2xl shadow-xl shadow-navy/20">
        <Icon name="heroicons:shield-check-20-solid" class="w-5 h-5 text-primary-400 mr-2" />
        <span class="font-black text-sm uppercase tracking-widest">Admin Mode</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div v-if="statsPending" v-for="i in 4" :key="i" class="bg-white p-8 rounded-[32px] border border-gray-100 animate-pulse">
        <div class="h-14 w-14 bg-gray-100 rounded-2xl mb-6"></div>
        <div class="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-gray-100 rounded w-3/4"></div>
      </div>
      <div v-else v-for="stat in stats" :key="stat.label" class="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-navy/5 hover:-translate-y-1 hover:shadow-navy/10 transition-all relative overflow-hidden">
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
          <p class="text-gray-400 text-xs font-black uppercase tracking-[0.15em]">{{ stat.label }}</p>
          <p class="text-3xl font-black text-navy mt-2 tracking-tight">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Nav Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <NuxtLink to="/admin/dashboard/mitras" class="group bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 p-10 hover:border-primary-200 hover:shadow-primary-900/10 transition-all duration-500 overflow-hidden relative">
        <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div class="relative z-10">
          <div class="w-16 h-16 bg-navy rounded-3xl flex items-center justify-center shadow-xl shadow-navy/20 mb-8 group-hover:rotate-12 transition-transform">
            <Icon name="heroicons:building-storefront-20-solid" class="w-8 h-8 text-primary-400" />
          </div>
          <h2 class="text-2xl font-black text-navy tracking-tight">Kelola Mitra</h2>
          <p class="text-gray-500 font-medium mt-2 leading-relaxed">Lihat semua mitra, detail profil, unit PS, snack, foto, dan jam operasional.</p>
          <div class="flex items-center mt-8 text-primary-500 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
            Buka Halaman
            <Icon name="heroicons:arrow-right-20-solid" class="ml-2 w-4 h-4" />
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/dashboard/users" class="group bg-navy rounded-[40px] border border-navy shadow-xl shadow-navy/20 p-10 hover:bg-primary-800 transition-all duration-500 overflow-hidden relative">
        <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-primary-500/10 blur-[60px] rounded-full group-hover:bg-primary-500/20 transition-all"></div>
        <div class="relative z-10">
          <div class="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform border border-white/10">
            <Icon name="heroicons:users-20-solid" class="w-8 h-8 text-primary-400 group-hover:text-navy" />
          </div>
          <h2 class="text-2xl font-black text-white group-hover:text-white tracking-tight transition-colors">Kelola User</h2>
          <p class="text-white/60 group-hover:text-white font-medium mt-2 leading-relaxed transition-colors">Lihat daftar pengguna, profil lengkap, data NIK, dan riwayat transaksi mereka.</p>
          <div class="flex items-center mt-8 text-primary-400 group-hover:text-white font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-all">
            Buka Halaman
            <Icon name="heroicons:arrow-right-20-solid" class="ml-2 w-4 h-4" />
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Pending Approval Section -->
    <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="w-2 h-8 bg-amber-500 rounded-full"></div>
          <h2 class="text-2xl font-black text-navy tracking-tight">Pendaftaran Menunggu</h2>
        </div>
        <span class="bg-amber-50 text-amber-600 border border-amber-100 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          {{ pendingMitras.length }} Pending
        </span>
      </div>

      <div v-if="pendingLoading" class="p-20 text-center flex flex-col items-center">
        <Icon name="svg-spinners:ring-resize" class="w-12 h-12 text-primary-500 mb-4" />
        <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Memuat data pendaftaran...</p>
      </div>

      <div v-else-if="pendingMitras.length > 0" class="divide-y divide-gray-50">
        <div v-for="mitra in pendingMitras" :key="mitra.id" class="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-amber-50/20 transition-colors gap-6">
          <div class="flex items-center space-x-6">
            <div class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img v-if="mitra.photos?.find(p => p.isMain)?.photoUrl" :src="mitra.photos.find(p => p.isMain).photoUrl" class="w-full h-full object-cover" />
              <Icon v-else name="heroicons:building-storefront-20-solid" class="w-8 h-8 text-gray-300" />
            </div>
            <div>
              <h3 class="text-xl font-black text-navy tracking-tight">{{ mitra.shopName }}</h3>
              <p class="text-sm font-bold text-gray-500 mt-0.5">{{ mitra.user?.name }} · {{ mitra.user?.email }}</p>
              <div class="flex items-center text-xs text-gray-400 font-bold mt-1">
                <Icon name="heroicons:map-pin-20-solid" class="w-3.5 h-3.5 mr-1" />
                <span class="truncate max-w-[300px]">{{ mitra.address }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <NuxtLink :to="`/admin/dashboard/mitras`" class="px-5 py-2.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
              Detail
            </NuxtLink>
            <button
              @click="rejectMitra(mitra.id)"
              class="px-5 py-2.5 border border-red-100 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              Tolak
            </button>
            <button
              @click="approveMitra(mitra.id)"
              class="px-6 py-2.5 bg-navy text-white hover:bg-primary-500 hover:text-navy rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-navy/10 transition-all active:scale-95"
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      <div v-else class="p-24 text-center">
        <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:check-badge-20-solid" class="w-12 h-12 text-green-400" />
        </div>
        <h3 class="text-2xl font-black text-navy mb-3 tracking-tight">Semua Sudah Diproses</h3>
        <p class="text-gray-400 font-bold">Tidak ada pendaftaran mitra yang menunggu persetujuan saat ini.</p>
      </div>
    </div>
  </div>
</template>
