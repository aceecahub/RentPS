<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value || user.value?.role !== 'ADMIN') {
  navigateTo('/')
}

const searchQuery = ref('')

const { data: response, pending } = await useFetch(`${config.public.apiBase}/user/all`)

const allUsers = computed(() => response.value?.data || [])
const filteredUsers = computed(() => {
  if (!searchQuery.value) return allUsers.value
  const q = searchQuery.value.toLowerCase()
  return allUsers.value.filter(u =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.userProfile?.phone?.toLowerCase().includes(q)
  )
})

// Selected user for detail panel
const selectedUser = ref(null)

const openDetail = (u) => {
  selectedUser.value = selectedUser.value?.id === u.id ? null : u
}
const closeDetail = () => {
  selectedUser.value = null
}

const getStatusBadge = (count) => {
  if (count === 0) return 'bg-gray-50 text-gray-400 border-gray-100'
  if (count >= 5) return 'bg-primary-50 text-primary-600 border-primary-100'
  return 'bg-blue-50 text-blue-600 border-blue-100'
}

const getBookingStatusClass = (status) => {
  const map = {
    WAITING_PAYMENT: 'bg-amber-50 text-amber-600',
    CONFIRMED: 'bg-blue-50 text-blue-600',
    ONGOING: 'bg-indigo-50 text-indigo-600',
    COMPLETED: 'bg-green-50 text-green-600',
    CANCELLED: 'bg-red-50 text-red-600',
  }
  return map[status] || 'bg-gray-50 text-gray-600'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="p-4 md:p-10 min-h-screen bg-gray-50/30">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
      <div>
        <h1 class="text-4xl font-black text-navy tracking-tight">Manajemen Customer</h1>
        <p class="text-gray-500 font-medium mt-1">Pantau seluruh pelanggan yang terdaftar di platform.</p>
      </div>
      <NuxtLink to="/admin/dashboard" class="group bg-white border-2 border-gray-100 text-navy px-6 py-3 rounded-2xl font-black text-sm hover:border-navy transition-all flex items-center shadow-sm">
        <Icon name="heroicons:arrow-left-20-solid" class="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm text-center">
        <p class="text-3xl font-black text-navy">{{ allUsers.length }}</p>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Total Customer</p>
      </div>
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm text-center">
        <p class="text-3xl font-black text-green-600">{{ allUsers.filter(u => u._count.bookings > 0).length }}</p>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Pernah Booking</p>
      </div>
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm text-center">
        <p class="text-3xl font-black text-primary-500">{{ allUsers.filter(u => u.userProfile?.nik).length }}</p>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Terverifikasi NIK</p>
      </div>
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm text-center">
        <p class="text-3xl font-black text-navy">{{ allUsers.reduce((s, u) => s + u._count.bookings, 0) }}</p>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Total Transaksi</p>
      </div>
    </div>

    <!-- Search -->
    <div class="relative mb-8">
      <Icon name="heroicons:magnifying-glass-20-solid" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari nama, email, atau nomor HP..."
        class="w-full bg-white border-2 border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-navy font-bold focus:outline-none focus:border-primary-500 transition-all shadow-sm"
      >
    </div>

    <!-- Layout with detail panel -->
    <div class="flex gap-8">
      <!-- User list table -->
      <div class="flex-grow min-w-0">
        <div v-if="pending" class="space-y-3">
          <div v-for="i in 6" :key="i" class="h-20 bg-white rounded-[24px] border border-gray-100 animate-pulse"></div>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-32 bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Icon name="heroicons:users" class="w-12 h-12 text-gray-200" />
          </div>
          <h3 class="text-2xl font-black text-navy mb-3 tracking-tight">Tidak Ada User</h3>
          <p class="text-gray-500 font-medium">Tidak ditemukan user yang sesuai dengan pencarian.</p>
        </div>

        <div v-else class="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                <th class="px-8 py-5 font-black">Pengguna</th>
                <th class="px-8 py-5 font-black hidden md:table-cell">Kontak</th>
                <th class="px-8 py-5 font-black text-center">Total Booking</th>
                <th class="px-8 py-5 font-black hidden lg:table-cell">Bergabung</th>
                <th class="px-8 py-5 font-black text-center">NIK</th>
                <th class="px-8 py-5 font-black text-center">Detail</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="u in filteredUsers"
                :key="u.id"
                class="group hover:bg-primary-50/30 transition-all cursor-pointer"
                :class="selectedUser?.id === u.id ? 'bg-primary-50/50' : ''"
                @click="openDetail(u)"
              >
                <td class="px-8 py-5">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-navy">
                      <img v-if="u.userProfile?.avatarUrl" :src="u.userProfile.avatarUrl" class="w-full h-full object-cover" />
                      <span v-else class="text-primary-400 font-black text-lg">{{ u.name?.charAt(0)?.toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="font-black text-navy tracking-tight">{{ u.name }}</p>
                      <p class="text-xs text-gray-400 font-bold">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5 hidden md:table-cell">
                  <p class="text-sm font-bold text-gray-700">{{ u.userProfile?.phone || '-' }}</p>
                  <p class="text-xs text-gray-400 font-bold mt-0.5 truncate max-w-[160px]">{{ u.userProfile?.address || '-' }}</p>
                </td>
                <td class="px-8 py-5 text-center">
                  <span class="px-4 py-2 rounded-xl text-xs font-black border" :class="getStatusBadge(u._count.bookings)">
                    {{ u._count.bookings }} Booking
                  </span>
                </td>
                <td class="px-8 py-5 hidden lg:table-cell">
                  <p class="text-sm font-bold text-gray-600">{{ formatDate(u.createdAt) }}</p>
                </td>
                <td class="px-8 py-5 text-center">
                  <div v-if="u.userProfile?.nik" class="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="heroicons:check-badge-20-solid" class="w-5 h-5 text-green-500" />
                  </div>
                  <div v-else class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="heroicons:minus-20-solid" class="w-4 h-4 text-gray-300" />
                  </div>
                </td>
                <td class="px-8 py-5 text-center">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all"
                    :class="selectedUser?.id === u.id ? 'bg-primary-500' : 'bg-gray-50 group-hover:bg-gray-100'">
                    <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4" :class="selectedUser?.id === u.id ? 'text-white' : 'text-gray-400'" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Side Panel -->
      <Transition name="slide-panel">
        <div v-if="selectedUser" class="w-full md:w-[380px] shrink-0">
          <div class="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-navy/10 sticky top-10 overflow-hidden max-h-[calc(100vh-80px)] flex flex-col">
            <!-- Panel Header -->
            <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
              <h3 class="text-xl font-black text-navy tracking-tight">Profil User</h3>
              <button @click="closeDetail" class="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Icon name="heroicons:x-mark-20-solid" class="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div class="flex-grow overflow-y-auto">
              <!-- Avatar & Identity -->
              <div class="p-8 border-b border-gray-50 text-center">
                <div class="w-24 h-24 rounded-full overflow-hidden bg-navy mx-auto mb-5 flex items-center justify-center shadow-xl shadow-navy/20">
                  <img v-if="selectedUser.userProfile?.avatarUrl" :src="selectedUser.userProfile.avatarUrl" class="w-full h-full object-cover" />
                  <span v-else class="text-primary-400 font-black text-4xl">{{ selectedUser.name?.charAt(0)?.toUpperCase() }}</span>
                </div>
                <h2 class="text-2xl font-black text-navy tracking-tight">{{ selectedUser.name }}</h2>
                <p class="text-gray-500 font-bold mt-1">{{ selectedUser.email }}</p>
                <div class="flex items-center justify-center mt-4 gap-3">
                  <span class="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">USER</span>
                  <span v-if="selectedUser.userProfile?.nik" class="bg-green-50 text-green-600 border border-green-100 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">NIK Verified</span>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="p-8 border-b border-gray-50 space-y-5">
                <div class="flex items-center space-x-3 mb-5">
                  <div class="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                  <h4 class="text-lg font-black text-navy">Informasi Kontak</h4>
                </div>

                <div class="space-y-4">
                  <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div class="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                      <Icon name="heroicons:phone-20-solid" class="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomor HP</p>
                      <p class="font-black text-navy mt-0.5">{{ selectedUser.userProfile?.phone || 'Belum diisi' }}</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div class="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                      <Icon name="heroicons:map-pin-20-solid" class="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat</p>
                      <p class="font-bold text-navy mt-0.5 text-sm leading-relaxed">{{ selectedUser.userProfile?.address || 'Belum diisi' }}</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div class="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                      <Icon name="heroicons:shield-check-20-solid" class="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">NIK</p>
                      <p class="font-black text-navy mt-0.5 font-mono tracking-wider">{{ selectedUser.userProfile?.nik || 'Belum diisi' }}</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div class="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                      <Icon name="heroicons:calendar-20-solid" class="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bergabung Sejak</p>
                      <p class="font-black text-navy mt-0.5">{{ formatDate(selectedUser.createdAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Booking History -->
              <div class="p-8">
                <div class="flex items-center space-x-3 mb-5">
                  <div class="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                  <h4 class="text-lg font-black text-navy">Riwayat Booking</h4>
                  <span class="ml-auto bg-navy text-white text-xs font-black px-3 py-1 rounded-full">{{ selectedUser._count?.bookings || 0 }}</span>
                </div>

                <div v-if="!selectedUser.bookings?.length" class="text-center py-8 text-gray-400 text-sm font-bold">
                  Belum pernah melakukan booking
                </div>
                <div v-else class="space-y-3">
                  <div v-for="booking in selectedUser.bookings" :key="booking.id" class="flex items-center justify-between p-4 rounded-2xl border border-gray-100">
                    <div>
                      <p class="font-black text-navy text-sm">#BK-{{ String(booking.id).padStart(4, '0') }}</p>
                      <p class="text-xs font-bold text-gray-400 mt-0.5">Rp{{ parseFloat(booking.totalPrice || 0).toLocaleString() }}</p>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl" :class="getBookingStatusClass(booking.status)">
                      {{ booking.status }}
                    </span>
                  </div>
                  <p v-if="selectedUser._count?.bookings > 5" class="text-center text-xs font-black text-gray-400 uppercase tracking-widest pt-2">
                    +{{ selectedUser._count.bookings - 5 }} booking lainnya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-panel-enter-active, .slide-panel-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-panel-enter-from, .slide-panel-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
