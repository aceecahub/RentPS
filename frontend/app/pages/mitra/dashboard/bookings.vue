<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()


const { data: response, pending, refresh } = await useFetch(`${config.public.apiBase}/booking/mitra`, {
  key: 'mitra-all-bookings',
  query: computed(() => ({ userId: user.value?.id })),
  headers: useRequestHeaders(['cookie']),
  watch: [user]
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

const getStatusLabel = (status) => {
  const labels = {
    WAITING_PAYMENT: 'Menunggu Bayar',
    CONFIRMED: 'Sudah Dibayar',
    ONGOING: 'Sedang Main',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return labels[status] || status
}

const updateStatus = async (bookingId, newStatus) => {
  if(!confirm(`Ubah status pesanan menjadi ${getStatusLabel(newStatus)}?`)) return

  try {
    await $fetch(`${config.public.apiBase}/booking/${bookingId}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    refresh()
  } catch (err) {
    alert('Gagal mengubah status pesanan')
  }
}
</script>

<template>
  <div class="py-10 px-4 md:px-6 space-y-10 bg-slate-50/50 min-h-screen">
    <!-- Header -->
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="flex items-center space-x-4">
        <NuxtLink to="/mitra/dashboard" class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-navy shadow-sm hover:bg-slate-50 transition-colors">
          <Icon name="heroicons:arrow-left-20-solid" class="w-4.5 h-4.5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Kelola Pesanan</h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Daftar transaksi penyewaan PlayStation di rental Anda.</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <button @click="refresh" class="bg-white border border-slate-200 text-navy p-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <Icon name="heroicons:arrow-path-20-solid" class="w-4.5 h-4.5" />
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div v-if="pending" class="space-y-4">
        <div v-for="i in 4" :key="i" class="h-20 bg-white border border-slate-200 rounded-xl animate-pulse"></div>
      </div>

      <div v-else-if="bookings.length === 0" class="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50">
        <div class="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Icon name="heroicons:clipboard-document-list" class="w-8 h-8 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-navy">Belum Ada Pesanan</h3>
        <p class="text-slate-500 text-sm font-medium mt-1">Data pesanan dari pelanggan akan muncul secara otomatis di sini.</p>
      </div>

      <div v-else class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-150">
                <th class="px-6 py-3.5 font-bold">Penyewa</th>
                <th class="px-6 py-3.5 font-bold">Jadwal Main</th>
                <th class="px-6 py-3.5 font-bold text-center">Unit Console</th>
                <th class="px-6 py-3.5 font-bold">Pembayaran</th>
                <th class="px-6 py-3.5 font-bold text-center">Status</th>
                <th class="px-6 py-3.5 font-bold text-right">Opsi Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in bookings" :key="b.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3.5">
                    <div class="w-8 h-8 bg-navy rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                      {{ b.renterName.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-bold text-navy tracking-tight">{{ b.renterName }}</p>
                      <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{{ b.renterPhone }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="space-y-0.5">
                    <p class="font-bold text-slate-700 text-sm">{{ new Date(b.startTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) }}</p>
                    <div class="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Icon name="heroicons:clock-20-solid" class="w-3.5 h-3.5 mr-1" />
                      {{ new Date(b.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} - 
                      {{ new Date(b.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="inline-flex flex-col items-center">
                    <div class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-navy mb-1 transition-transform group-hover:scale-105">
                      <Icon :name="b.unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-4.5 h-4.5" />
                    </div>
                    <span class="text-[10px] font-bold text-navy uppercase tracking-wider">{{ b.unit.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-navy text-base tracking-tight">Rp{{ parseFloat(b.totalPrice).toLocaleString() }}</p>
                  <span class="text-[9px] font-bold uppercase tracking-wider text-primary-600">{{ b.durationHour }} Jam Sewa</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border" :class="getStatusClasses(b.status)">
                    {{ getStatusLabel(b.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <template v-if="b.status === 'WAITING_PAYMENT'">
                      <button @click="updateStatus(b.id, 'CONFIRMED')" class="bg-navy hover:bg-primary-600 hover:text-white text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        Konfirmasi
                      </button>
                      <button @click="updateStatus(b.id, 'CANCELLED')" class="bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        Batal
                      </button>
                    </template>

                    <template v-else-if="b.status === 'CONFIRMED'">
                      <button @click="updateStatus(b.id, 'ONGOING')" class="bg-primary-500 text-navy text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
                        Mulai Sesi
                      </button>
                    </template>

                    <template v-else-if="b.status === 'ONGOING'">
                      <button @click="updateStatus(b.id, 'COMPLETED')" class="bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                        Selesaikan
                      </button>
                    </template>
                    
                    <span v-else class="text-[10px] font-bold text-slate-300 uppercase tracking-wider italic">Archived</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
