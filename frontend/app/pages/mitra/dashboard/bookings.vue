<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value || user.value?.role !== 'MITRA') {
  navigateTo('/')
}

const { data: response, pending, refresh } = await useFetch(`${config.public.apiBase}/booking/mitra`, {
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

const getStatusLabel = (status) => {
  const labels = {
    WAITING_PAYMENT: 'Menunggu Pembayaran',
    CONFIRMED: 'Sudah Dibayar (Confirmed)',
    ONGOING: 'Sedang Main (Ongoing)',
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
  <div class="p-8 space-y-8 max-w-7xl mx-auto">
    <div class="flex items-center space-x-4 mb-6">
      <NuxtLink to="/mitra/dashboard" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-navy hover:text-white transition-colors">
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-3xl font-black text-navy">Kelola Pesanan</h1>
        <p class="text-gray-500">Daftar pesanan rental PlayStation dari pelanggan Anda.</p>
      </div>
    </div>

    <div v-if="pending" class="animate-pulse space-y-4">
      <div class="h-24 bg-gray-200 rounded-3xl w-full"></div>
      <div class="h-24 bg-gray-200 rounded-3xl w-full"></div>
    </div>

    <div v-else-if="bookings.length === 0" class="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <Icon name="heroicons:clipboard-document-list" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-navy mb-2">Belum Ada Pesanan</h3>
      <p class="text-gray-500">Pesanan dari pelanggan akan muncul di sini.</p>
    </div>

    <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th class="px-6 py-4 font-bold">Data Penyewa</th>
              <th class="px-6 py-4 font-bold">Jadwal Bermain</th>
              <th class="px-6 py-4 font-bold">Unit PS</th>
              <th class="px-6 py-4 font-bold">Total Harga</th>
              <th class="px-6 py-4 font-bold text-center">Status</th>
              <th class="px-6 py-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="b in bookings" :key="b.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <p class="font-bold text-navy">{{ b.renterName }}</p>
                <p class="text-xs text-gray-500">{{ b.renterPhone }}</p>
                <p class="text-[10px] text-gray-400">NIK: {{ b.renterNik }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="font-bold text-navy">{{ new Date(b.startTime).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) }}</p>
                <p class="text-xs text-gray-500">
                  {{ new Date(b.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} - 
                  {{ new Date(b.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                </p>
                <span class="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ b.durationHour }} Jam</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-600">
                    <Icon :name="b.unit.type === 'PS5' ? 'heroicons:cpu-chip' : 'heroicons:computer-desktop'" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-bold text-navy text-sm">{{ b.unit.name }}</p>
                    <p class="text-[10px] text-gray-500">{{ b.unit.type }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="font-black text-primary-600">Rp{{ parseFloat(b.totalPrice).toLocaleString() }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="px-3 py-1 text-xs font-bold rounded-full border" :class="getStatusColor(b.status)">
                  {{ getStatusLabel(b.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end space-x-2">
                  <!-- Aksi Berdasarkan Status -->
                  <template v-if="b.status === 'WAITING_PAYMENT'">
                    <button @click="updateStatus(b.id, 'CONFIRMED')" class="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      Terima Pembayaran
                    </button>
                    <button @click="updateStatus(b.id, 'CANCELLED')" class="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      Batal
                    </button>
                  </template>

                  <template v-else-if="b.status === 'CONFIRMED'">
                    <button @click="updateStatus(b.id, 'ONGOING')" class="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      Mulai Main
                    </button>
                  </template>

                  <template v-else-if="b.status === 'ONGOING'">
                    <button @click="updateStatus(b.id, 'COMPLETED')" class="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                      Selesaikan
                    </button>
                  </template>
                  
                  <span v-else class="text-xs text-gray-400 italic">Tidak ada aksi</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
