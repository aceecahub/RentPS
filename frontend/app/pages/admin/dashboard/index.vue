<script setup>
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
    alert('Mitra telah disetujui!')
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
      body: { 
        approvalStatus: 'REJECTED',
        rejectionReason: reason
      }
    })
    alert('Pendaftaran mitra ditolak.')
    refreshList()
  } catch (error) {
    alert('Gagal menolak mitra')
  }
}
</script>

<template>
  <div class="p-8 space-y-10">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-navy">Panel Admin</h1>
        <p class="text-gray-500">Kelola pendaftaran mitra dan pengawasan platform.</p>
      </div>
      <div class="flex space-x-3">
        <div class="bg-navy text-white px-4 py-2 rounded-xl flex items-center space-x-2">
          <Icon name="heroicons:user-group" class="w-5 h-5" />
          <span class="font-bold">{{ statsRes?.data?.totalMitra || 0 }} Total Mitra</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-if="statsPending" v-for="i in 3" :key="i" class="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse">
        <div class="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
        <div class="h-10 bg-gray-100 rounded w-3/4"></div>
      </div>
      <template v-else>
        <div class="bg-white p-6 rounded-2xl border-l-4 border-l-orange-500 shadow-sm border border-gray-100">
          <p class="text-gray-500 text-sm font-medium">Menunggu Persetujuan</p>
          <p class="text-3xl font-black text-navy mt-1">{{ statsRes?.data?.pendingMitra }} Mitra</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border-l-4 border-l-green-500 shadow-sm border border-gray-100">
          <p class="text-gray-500 text-sm font-medium">Mitra Aktif</p>
          <p class="text-3xl font-black text-navy mt-1">{{ statsRes?.data?.activeMitra }} Mitra</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 shadow-sm border border-gray-100">
          <p class="text-gray-500 text-sm font-medium">Total Booking Platform</p>
          <p class="text-3xl font-black text-navy mt-1">{{ statsRes?.data?.totalBookings.toLocaleString() }}</p>
        </div>
      </template>
    </div>

    <!-- Approval List -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 class="text-xl font-bold text-navy">Pendaftaran Mitra Baru</h2>
        <span class="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-black">PENDING</span>
      </div>
      
      <div v-if="pendingLoading" class="p-20 text-center text-gray-400">Memuat data pendaftaran...</div>
      
      <div v-else-if="pendingMitras.length > 0" class="divide-y divide-gray-50">
        <div v-for="mitra in pendingMitras" :key="mitra.id" class="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
          <div class="flex items-center space-x-6 mb-4 md:mb-0">
            <div class="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
              <Icon name="heroicons:building-storefront" class="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-navy">{{ mitra.shopName }}</h3>
              <p class="text-sm text-gray-600 font-medium">{{ mitra.user?.name || 'Owner' }}</p>
              <div class="flex items-center text-xs text-gray-400 mt-1">
                <Icon name="heroicons:identification" class="w-4 h-4 mr-1" />
                <span>NIK: {{ mitra.nik }}</span>
                <span class="mx-2">•</span>
                <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
                <span class="truncate max-w-[200px]">{{ mitra.address }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button 
              @click="rejectMitra(mitra.id)"
              class="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors"
            >
              Tolak
            </button>
            <button 
              @click="approveMitra(mitra.id)"
              class="px-6 py-2 bg-navy text-white hover:bg-navy-light rounded-xl font-bold text-sm shadow-lg shadow-navy/20 transition-all active:scale-95"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
      <div v-else class="p-20 text-center">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:check-badge" class="w-10 h-10 text-gray-300" />
        </div>
        <h3 class="text-lg font-bold text-gray-400">Semua pendaftaran telah diproses.</h3>
      </div>
    </div>
  </div>
</template>
