<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value || user.value?.role !== 'ADMIN') {
  navigateTo('/auth/login')
}

const searchQuery = ref('')

const { data: response, pending } = await useFetch(`${config.public.apiBase}/user/all`, {
  key: 'admin-all-users',
  headers: useRequestHeaders(['cookie'])
})

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

const selectedUser = ref(null)

const openDetail = (u) => {
  selectedUser.value = selectedUser.value?.id === u.id ? null : u
}
const closeDetail = () => {
  selectedUser.value = null
}

const getStatusBadge = (count) => {
  if (count === 0) return 'bg-slate-50 text-slate-400 border-slate-200'
  if (count >= 5) return 'bg-primary-50 text-primary-700 border-primary-200'
  return 'bg-blue-50 text-blue-700 border-blue-200'
}

const getBookingStatusClass = (status) => {
  const map = {
    WAITING_PAYMENT: 'bg-amber-50 text-amber-700',
    CONFIRMED: 'bg-blue-50 text-blue-700',
    ONGOING: 'bg-indigo-50 text-indigo-700',
    COMPLETED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-red-50 text-red-700',
  }
  return map[status] || 'bg-slate-50 text-slate-600'
}

const getBookingStatusLabel = (status) => {
  const map = {
    WAITING_PAYMENT: 'Menunggu',
    CONFIRMED: 'Terkonfirmasi',
    ONGOING: 'Berlangsung',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return map[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<<template>
  <div class="min-h-screen bg-slate-50/50 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Manajemen Customer</h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Pantau seluruh pelanggan yang terdaftar di platform.</p>
        </div>
        <NuxtLink to="/admin/dashboard" class="inline-flex items-center gap-2 bg-white border border-slate-200 text-navy px-4 py-2.5 rounded-lg font-bold text-sm hover:border-navy transition-all shadow-sm">
          <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4" />
          Kembali
        </NuxtLink>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p class="text-2xl font-black text-navy">{{ allUsers.length }}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Customer</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p class="text-2xl font-black text-green-600">{{ allUsers.filter(u => u._count.bookings > 0).length }}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pernah Booking</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p class="text-2xl font-black text-primary-600">{{ allUsers.filter(u => u.userProfile?.nik).length }}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Terverifikasi NIK</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p class="text-2xl font-black text-navy">{{ allUsers.reduce((s, u) => s + u._count.bookings, 0) }}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Transaksi</p>
        </div>
      </div>

      <!-- Search -->
      <div class="relative mb-6">
        <Icon name="heroicons:magnifying-glass-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama, email, atau nomor HP..."
          class="w-full bg-white border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
        >
      </div>

      <!-- Layout -->
      <div class="flex flex-col lg:flex-row gap-6">
        
        <!-- User List -->
        <div class="flex-grow min-w-0">
          <div v-if="pending" class="space-y-3">
            <div v-for="i in 6" :key="i" class="h-16 bg-white rounded-xl border border-slate-100 animate-pulse"></div>
          </div>

          <div v-else-if="filteredUsers.length === 0" class="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div class="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="heroicons:users-20-solid" class="w-7 h-7 text-slate-300" />
            </div>
            <h3 class="text-lg font-bold text-navy">Tidak Ada User</h3>
            <p class="text-slate-500 text-sm font-medium mt-1">Tidak ditemukan user yang sesuai dengan pencarian.</p>
          </div>

          <div v-else class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <!-- Mobile Cards -->
            <div class="lg:hidden divide-y divide-slate-50">
              <div
                v-for="u in filteredUsers"
                :key="u.id"
                class="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                :class="selectedUser?.id === u.id ? 'bg-primary-50/50' : ''"
                @click="openDetail(u)"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-navy">
                    <img v-if="u.userProfile?.avatarUrl" :src="u.userProfile.avatarUrl" class="w-full h-full object-cover" />
                    <span v-else class="text-primary-400 font-bold text-sm">{{ u.name?.charAt(0)?.toUpperCase() }}</span>
                  </div>
                  <div class="flex-grow min-w-0">
                    <p class="font-bold text-navy text-sm truncate">{{ u.name }}</p>
                    <p class="text-xs text-slate-400 font-medium truncate">{{ u.email }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] text-slate-500 font-medium">{{ u.userProfile?.phone || '-' }}</span>
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold border" :class="getStatusBadge(u._count.bookings)">
                        {{ u._count.bookings }}
                      </span>
                    </div>
                  </div>
                  <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4 text-slate-300" :class="selectedUser?.id === u.id ? 'text-primary-500' : ''" />
                </div>
              </div>
            </div>

            <!-- Desktop Table -->
            <table class="w-full text-left border-collapse hidden lg:table">
              <thead>
                <tr class="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th class="px-6 py-4 font-bold">Pengguna</th>
                  <th class="px-6 py-4 font-bold">Kontak</th>
                  <th class="px-6 py-4 font-bold text-center">Booking</th>
                  <th class="px-6 py-4 font-bold">Bergabung</th>
                  <th class="px-6 py-4 font-bold text-center">NIK</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="u in filteredUsers"
                  :key="u.id"
                  class="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  :class="selectedUser?.id === u.id ? 'bg-primary-50/50' : ''"
                  @click="openDetail(u)"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden bg-navy flex-shrink-0">
                        <img v-if="u.userProfile?.avatarUrl" :src="u.userProfile.avatarUrl" class="w-full h-full object-cover" />
                        <span v-else class="text-primary-400 font-bold text-sm">{{ u.name?.charAt(0)?.toUpperCase() }}</span>
                      </div>
                      <div>
                        <p class="font-bold text-navy text-sm">{{ u.name }}</p>
                        <p class="text-xs text-slate-400 font-medium">{{ u.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-sm font-medium text-slate-700">{{ u.userProfile?.phone || '-' }}</p>
                    <p class="text-xs text-slate-400 font-medium truncate max-w-[140px]">{{ u.userProfile?.address || '-' }}</p>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-3 py-1 rounded-md text-xs font-bold border" :class="getStatusBadge(u._count.bookings)">
                      {{ u._count.bookings }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-sm font-medium text-slate-600">{{ formatDate(u.createdAt) }}</p>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <Icon v-if="u.userProfile?.nik" name="heroicons:check-circle-20-solid" class="w-5 h-5 text-green-500 mx-auto" />
                    <Icon v-else name="heroicons:minus-circle-20-solid" class="w-5 h-5 text-slate-300 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detail Panel -->
        <Transition name="slide-panel">
          <div v-if="selectedUser" class="w-full lg:w-[380px] shrink-0">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-lg lg:sticky lg:top-6 overflow-hidden max-h-[calc(100vh-60px)] flex flex-col">
              
              <!-- Header -->
              <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h3 class="text-base font-bold text-navy">Profil User</h3>
                <button @click="closeDetail" class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <Icon name="heroicons:x-mark-20-solid" class="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div class="flex-grow overflow-y-auto custom-scrollbar">
                <!-- Identity -->
                <div class="p-5 border-b border-slate-100 text-center">
                  <div class="w-16 h-16 rounded-full overflow-hidden bg-navy mx-auto mb-3 flex items-center justify-center">
                    <img v-if="selectedUser.userProfile?.avatarUrl" :src="selectedUser.userProfile.avatarUrl" class="w-full h-full object-cover" />
                    <span v-else class="text-primary-400 font-black text-2xl">{{ selectedUser.name?.charAt(0)?.toUpperCase() }}</span>
                  </div>
                  <h2 class="text-lg font-bold text-navy">{{ selectedUser.name }}</h2>
                  <p class="text-slate-500 text-sm font-medium">{{ selectedUser.email }}</p>
                  <div class="flex items-center justify-center mt-3 gap-2">
                    <span class="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">User</span>
                    <span v-if="selectedUser.userProfile?.nik" class="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">NIK Terverifikasi</span>
                  </div>
                </div>

                <!-- Contact -->
                <div class="p-5 border-b border-slate-100 space-y-3">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <h4 class="text-sm font-bold text-navy">Informasi Kontak</h4>
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Icon name="heroicons:phone-20-solid" class="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor HP</p>
                        <p class="font-bold text-navy text-sm">{{ selectedUser.userProfile?.phone || 'Belum diisi' }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Icon name="heroicons:map-pin-20-solid" class="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat</p>
                        <p class="font-medium text-navy text-xs leading-relaxed">{{ selectedUser.userProfile?.address || 'Belum diisi' }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Icon name="heroicons:shield-check-20-solid" class="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NIK</p>
                        <p class="font-bold text-navy text-sm font-mono tracking-wider">{{ selectedUser.userProfile?.nik || 'Belum diisi' }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Icon name="heroicons:calendar-20-solid" class="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bergabung</p>
                        <p class="font-bold text-navy text-sm">{{ formatDate(selectedUser.createdAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bookings -->
                <div class="p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <h4 class="text-sm font-bold text-navy">Riwayat Booking</h4>
                    <span class="ml-auto bg-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ selectedUser._count?.bookings || 0 }}</span>
                  </div>

                  <div v-if="!selectedUser.bookings?.length" class="text-center py-6 text-slate-400 text-xs font-medium">
                    Belum pernah melakukan booking
                  </div>
                  <div v-else class="space-y-2">
                    <div v-for="booking in selectedUser.bookings.slice(0, 5)" :key="booking.id" class="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                      <div>
                        <p class="font-bold text-navy text-xs">#BK-{{ String(booking.id).padStart(4, '0') }}</p>
                        <p class="text-[10px] text-slate-400 font-medium mt-0.5">Rp{{ parseFloat(booking.totalPrice || 0).toLocaleString() }}</p>
                      </div>
                      <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex-shrink-0" :class="getBookingStatusClass(booking.status)">
                        {{ getBookingStatusLabel(booking.status) }}
                      </span>
                    </div>
                    <p v-if="selectedUser._count?.bookings > 5" class="text-center text-[10px] font-bold text-slate-400 pt-2">
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
  </div>
</template>

<style scoped>
.slide-panel-enter-active, .slide-panel-leave-active {
  transition: all 0.3s ease-out;
}
.slide-panel-enter-from, .slide-panel-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 999px;
}

html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>