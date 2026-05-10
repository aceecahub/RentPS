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
  <div class="p-4 md:p-10 space-y-12 bg-gray-50/30 min-h-screen">
    <!-- Header -->
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="flex items-center space-x-6">
        <NuxtLink to="/mitra/dashboard" class="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-navy shadow-sm hover:shadow-lg transition-all hover:-translate-x-1 group">
          <Icon name="heroicons:arrow-left-20-solid" class="w-6 h-6 group-hover:text-primary-500 transition-colors" />
        </NuxtLink>
        <div>
          <h1 class="text-4xl font-black text-navy tracking-tight">Kelola Pesanan</h1>
          <p class="text-gray-500 font-medium mt-1">Daftar transaksi penyewaan PlayStation di rental Anda.</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <button @click="refresh" class="bg-white border-2 border-gray-100 text-navy p-4 rounded-2xl hover:border-navy transition-all shadow-sm group">
          <Icon name="heroicons:arrow-path-20-solid" class="w-5 h-5 group-active:rotate-180 transition-transform" />
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div v-if="pending" class="space-y-6">
        <div v-for="i in 4" :key="i" class="h-24 bg-white border border-gray-100 rounded-[32px] animate-pulse"></div>
      </div>

      <div v-else-if="bookings.length === 0" class="text-center py-32 bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Icon name="heroicons:clipboard-document-list" class="w-12 h-12 text-gray-200" />
        </div>
        <h3 class="text-2xl font-black text-navy mb-3 tracking-tight">Belum Ada Pesanan</h3>
        <p class="text-gray-500 font-medium">Data pesanan dari pelanggan akan muncul secara otomatis di sini.</p>
      </div>

      <div v-else class="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                <th class="px-8 py-6 font-black">Penyewa</th>
                <th class="px-8 py-6 font-black">Jadwal Main</th>
                <th class="px-8 py-6 font-black text-center">Unit Console</th>
                <th class="px-8 py-6 font-black">Pembayaran</th>
                <th class="px-8 py-6 font-black text-center">Status</th>
                <th class="px-8 py-6 font-black text-right">Opsi Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="b in bookings" :key="b.id" class="group hover:bg-primary-50/30 transition-all">
                <td class="px-8 py-6">
                  <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                      {{ b.renterName.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-black text-navy tracking-tight">{{ b.renterName }}</p>
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{{ b.renterPhone }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="space-y-1">
                    <p class="font-bold text-gray-700 text-sm">{{ new Date(b.startTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) }}</p>
                    <div class="flex items-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      <Icon name="heroicons:clock-20-solid" class="w-3 h-3 mr-1" />
                      {{ new Date(b.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} - 
                      {{ new Date(b.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6 text-center">
                  <div class="inline-flex flex-col items-center">
                    <div class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-navy mb-1 group-hover:scale-110 transition-transform">
                      <Icon :name="b.unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-5 h-5" />
                    </div>
                    <span class="text-[10px] font-black text-navy uppercase tracking-widest">{{ b.unit.name }}</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <p class="font-black text-navy text-lg tracking-tight">Rp{{ parseFloat(b.totalPrice).toLocaleString() }}</p>
                  <span class="text-[9px] font-black uppercase tracking-[0.2em] text-primary-500">{{ b.durationHour }} Jam Sewa</span>
                </td>
                <td class="px-8 py-6 text-center">
                  <span class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border" :class="getStatusClasses(b.status)">
                    {{ getStatusLabel(b.status) }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex justify-end gap-3">
                    <template v-if="b.status === 'WAITING_PAYMENT'">
                      <button @click="updateStatus(b.id, 'CONFIRMED')" class="bg-navy text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-primary-500 hover:text-navy transition-all shadow-lg shadow-navy/10 active:scale-95">
                        Konfirmasi
                      </button>
                      <button @click="updateStatus(b.id, 'CANCELLED')" class="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95">
                        Batal
                      </button>
                    </template>

                    <template v-else-if="b.status === 'CONFIRMED'">
                      <button @click="updateStatus(b.id, 'ONGOING')" class="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                        Mulai Sesi
                      </button>
                    </template>

                    <template v-else-if="b.status === 'ONGOING'">
                      <button @click="updateStatus(b.id, 'COMPLETED')" class="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95">
                        Selesaikan
                      </button>
                    </template>
                    
                    <span v-else class="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Archived</span>
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
