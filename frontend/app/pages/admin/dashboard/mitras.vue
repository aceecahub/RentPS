<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value || user.value?.role !== 'ADMIN') {
  navigateTo('/auth/login')
}

// Filter state
const filterStatus = ref('')
const searchQuery = ref('')

const { data: response, pending, refresh } = await useFetch(`${config.public.apiBase}/mitra/admin/list`, {
  query: computed(() => filterStatus.value ? { status: filterStatus.value } : {})
})

const allMitras = computed(() => response.value?.data || [])
const filteredMitras = computed(() => {
  if (!searchQuery.value) return allMitras.value
  const q = searchQuery.value.toLowerCase()
  return allMitras.value.filter(m =>
    m.shopName?.toLowerCase().includes(q) ||
    m.user?.name?.toLowerCase().includes(q) ||
    m.address?.toLowerCase().includes(q)
  )
})

// Detail Panel
const selectedMitra = ref(null)
const detailPending = ref(false)

const openDetail = async (mitraId) => {
  detailPending.value = true
  selectedMitra.value = null
  try {
    const res = await $fetch(`${config.public.apiBase}/mitra/${mitraId}`)
    selectedMitra.value = res.data
  } catch (e) {
    alert('Gagal memuat detail mitra')
  } finally {
    detailPending.value = false
  }
}

const closeDetail = () => {
  selectedMitra.value = null
}

// Approve / Reject
const approveMitra = async (id) => {
  try {
    await $fetch(`${config.public.apiBase}/mitra/approve/${id}`, {
      method: 'PUT',
      body: { approvalStatus: 'APPROVED' }
    })
    refresh()
    if (selectedMitra.value?.id === id) {
      openDetail(id)
    }
  } catch (e) {
    alert('Gagal approve mitra')
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
    refresh()
    closeDetail()
  } catch (e) {
    alert('Gagal reject mitra')
  }
}

const getStatusClass = (status) => {
  const map = {
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200'
  }
  return map[status] || 'bg-slate-50 text-slate-600 border-slate-200'
}

const getStatusLabel = (status) => {
  const map = {
    APPROVED: 'Disetujui',
    PENDING: 'Menunggu',
    REJECTED: 'Ditolak'
  }
  return map[status] || status
}

const formatDay = (day) => {
  const map = { MONDAY: 'Senin', TUESDAY: 'Selasa', WEDNESDAY: 'Rabu', THURSDAY: 'Kamis', FRIDAY: 'Jumat', SATURDAY: 'Sabtu', SUNDAY: 'Minggu' }
  return map[day] || day
}
</script>

<<template>
  <div class="min-h-screen bg-slate-50/50 py-10" @click.self="closeDetail">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Manajemen Mitra</h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Kelola dan pantau semua mitra rental PS yang terdaftar.</p>
        </div>
        <NuxtLink to="/admin/dashboard" class="inline-flex items-center gap-2 bg-white border border-slate-200 text-navy px-4 py-2.5 rounded-lg font-bold text-sm hover:border-navy transition-all shadow-sm">
          <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4" />
          Kembali
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-3 mb-8">
        <div class="relative flex-grow">
          <Icon name="heroicons:magnifying-glass-20-solid" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama toko, pemilik, atau alamat..."
            class="w-full bg-white border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-navy font-bold text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
          >
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:mx-0 md:px-0">
          <button
            v-for="status in ['', 'APPROVED', 'PENDING', 'REJECTED']"
            :key="status"
            @click="filterStatus = status; refresh()"
            class="px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border whitespace-nowrap flex-shrink-0"
            :class="filterStatus === status ? 'bg-navy text-white border-navy shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'"
          >
            {{ status ? getStatusLabel(status) : 'Semua' }}
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="flex flex-col lg:flex-row gap-6">
        
        <!-- Mitra List -->
        <div class="flex-grow min-w-0">
          <div v-if="pending" class="space-y-3">
            <div v-for="i in 5" :key="i" class="h-24 bg-white rounded-xl border border-slate-100 animate-pulse"></div>
          </div>

          <div v-else-if="filteredMitras.length === 0" class="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div class="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="heroicons:building-storefront-20-solid" class="w-7 h-7 text-slate-300" />
            </div>
            <h3 class="text-lg font-bold text-navy">Tidak Ada Mitra</h3>
            <p class="text-slate-500 text-sm font-medium mt-1">Belum ada mitra yang sesuai filter yang dipilih.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="mitra in filteredMitras"
              :key="mitra.id"
              @click="openDetail(mitra.id)"
              class="group bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden"
              :class="selectedMitra?.id === mitra.id
                ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'"
            >
              <div class="p-4 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="relative flex-shrink-0">
                    <div class="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        v-if="mitra.photos?.find(p => p.isMain)?.photoUrl"
                        :src="mitra.photos.find(p => p.isMain).photoUrl"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <Icon name="heroicons:building-storefront-20-solid" class="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                      :class="{
                        'bg-green-500': mitra.approvalStatus === 'APPROVED',
                        'bg-amber-500': mitra.approvalStatus === 'PENDING',
                        'bg-red-500': mitra.approvalStatus === 'REJECTED'
                      }">
                    </div>
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-sm font-bold text-navy truncate group-hover:text-primary-600 transition-colors">{{ mitra.shopName }}</h3>
                    <p class="text-xs text-slate-500 font-medium">{{ mitra.user?.name }}</p>
                    <div class="flex items-center text-xs text-slate-400 mt-0.5">
                      <Icon name="heroicons:map-pin-20-solid" class="w-3 h-3 mr-1 flex-shrink-0" />
                      <span class="truncate max-w-[180px]">{{ mitra.address }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border" :class="getStatusClass(mitra.approvalStatus)">
                    {{ getStatusLabel(mitra.approvalStatus) }}
                  </span>
                  <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Side Panel -->
        <Transition name="slide-panel">
          <div v-if="selectedMitra || detailPending" class="w-full lg:w-[420px] shrink-0">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-lg lg:sticky lg:top-6 overflow-hidden max-h-[calc(100vh-60px)] flex flex-col">
              
              <!-- Panel Header -->
              <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <h3 class="text-base font-bold text-navy">Detail Mitra</h3>
                <button @click="closeDetail" class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <Icon name="heroicons:x-mark-20-solid" class="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <!-- Loading -->
              <div v-if="detailPending" class="flex-grow flex flex-col items-center justify-center p-12 space-y-3">
                <Icon name="svg-spinners:ring-resize" class="w-8 h-8 text-primary-500" />
                <p class="text-slate-400 font-bold text-xs uppercase tracking-wider">Memuat detail...</p>
              </div>

              <!-- Content -->
              <div v-else-if="selectedMitra" class="flex-grow overflow-y-auto custom-scrollbar">
                
                <!-- Shop Info -->
                <div class="p-5 border-b border-slate-100">
                  <div class="flex items-start gap-4">
                    <div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <img v-if="selectedMitra.photos?.find(p => p.isMain)?.photoUrl" :src="selectedMitra.photos.find(p => p.isMain).photoUrl" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center bg-navy">
                        <Icon name="heroicons:building-storefront-20-solid" class="w-6 h-6 text-primary-400/50" />
                      </div>
                    </div>
                    <div class="flex-grow min-w-0">
                      <h2 class="text-lg font-bold text-navy truncate">{{ selectedMitra.shopName }}</h2>
                      <p class="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5">{{ selectedMitra.address }}</p>
                      <span class="inline-block mt-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border" :class="getStatusClass(selectedMitra.approvalStatus)">
                        {{ getStatusLabel(selectedMitra.approvalStatus) }}
                      </span>
                    </div>
                  </div>
                  
                  <p v-if="selectedMitra.description" class="text-xs text-slate-500 font-medium mt-4 bg-slate-50 rounded-lg p-3 leading-relaxed">
                    {{ selectedMitra.description }}
                  </p>

                  <!-- Rejection Reason -->
                  <div v-if="selectedMitra.rejectionReason && selectedMitra.approvalStatus === 'REJECTED'" class="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">Alasan Penolakan:</p>
                    <p class="text-xs text-red-700 font-medium">{{ selectedMitra.rejectionReason }}</p>
                  </div>

                  <!-- Actions -->
                  <div v-if="selectedMitra.approvalStatus !== 'APPROVED'" class="flex gap-2 mt-4">
                    <button @click="approveMitra(selectedMitra.id)" class="flex-1 bg-navy hover:bg-primary-600 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95">
                      Setujui
                    </button>
                    <button @click="rejectMitra(selectedMitra.id)" class="flex-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border border-red-100 active:scale-95">
                      Tolak
                    </button>
                  </div>
                  <div v-else class="mt-4">
                    <button @click="rejectMitra(selectedMitra.id)" class="w-full bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border border-slate-200 active:scale-95">
                      Cabut Persetujuan
                    </button>
                  </div>
                </div>

                <!-- Units -->
                <div class="p-5 border-b border-slate-100">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <h4 class="text-sm font-bold text-navy">Unit PlayStation</h4>
                    <span class="ml-auto bg-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ selectedMitra.units?.length || 0 }}</span>
                  </div>
                  <div v-if="!selectedMitra.units?.length" class="text-center py-6 text-slate-400 text-xs font-medium">Belum ada unit terdaftar</div>
                  <div v-else class="space-y-2">
                    <div v-for="unit in selectedMitra.units" :key="unit.id" class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-navy rounded-md flex items-center justify-center">
                          <Icon :name="unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-4 h-4 text-primary-400" />
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-navy text-xs truncate">{{ unit.name }}</p>
                          <p class="text-[10px] text-primary-600 font-bold uppercase">{{ unit.type }}</p>
                        </div>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <p class="font-bold text-navy text-xs">Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}/j</p>
                        <span class="text-[10px] font-bold" :class="unit.isAvailable ? 'text-green-600' : 'text-red-500'">
                          {{ unit.isAvailable ? 'Tersedia' : 'Sibuk' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Snacks -->
                <div class="p-5 border-b border-slate-100">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <h4 class="text-sm font-bold text-navy">Inventaris Snack</h4>
                    <span class="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{{ selectedMitra.snacks?.length || 0 }}</span>
                  </div>
                  <div v-if="!selectedMitra.snacks?.length" class="text-center py-6 text-slate-400 text-xs font-medium">Belum ada snack tersedia</div>
                  <div v-else class="grid grid-cols-2 gap-2">
                    <div v-for="snack in selectedMitra.snacks" :key="snack.id" class="bg-slate-50 rounded-lg p-3">
                      <p class="font-bold text-navy text-xs truncate">{{ snack.name }}</p>
                      <p class="text-primary-600 font-bold text-xs mt-1">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-[10px] text-slate-400 font-bold">Stok</span>
                        <span class="text-[10px] font-bold" :class="snack.stock > 5 ? 'text-green-600' : 'text-red-500'">{{ snack.stock }} pcs</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Operating Hours -->
                <div class="p-5 border-b border-slate-100">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <h4 class="text-sm font-bold text-navy">Jam Operasional</h4>
                  </div>
                  <div v-if="!selectedMitra.operatingHours?.length" class="text-center py-6 text-slate-400 text-xs font-medium">Jam operasional belum diatur</div>
                  <div v-else class="space-y-1">
                    <div v-for="hour in selectedMitra.operatingHours" :key="hour.id" class="flex items-center justify-between py-2 px-3 rounded-lg" :class="hour.isOpen ? 'bg-green-50' : 'bg-slate-50'">
                      <span class="font-bold text-navy text-xs">{{ formatDay(hour.day) }}</span>
                      <span v-if="hour.isOpen" class="text-xs font-bold text-green-700">{{ hour.openTime }} – {{ hour.closeTime }}</span>
                      <span v-else class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Libur</span>
                    </div>
                  </div>
                </div>

                <!-- Gallery -->
                <div class="p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
                    <h4 class="text-sm font-bold text-navy">Galeri Foto</h4>
                    <span class="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{{ selectedMitra.photos?.length || 0 }}</span>
                  </div>
                  <div v-if="!selectedMitra.photos?.length" class="text-center py-6 text-slate-400 text-xs font-medium">Belum ada foto diunggah</div>
                  <div v-else class="grid grid-cols-2 gap-2">
                    <div v-for="photo in selectedMitra.photos" :key="photo.id" class="aspect-square rounded-lg overflow-hidden relative group">
                      <img :src="photo.photoUrl" :alt="photo.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span v-if="photo.isMain" class="absolute top-2 left-2 bg-primary-500 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Cover</span>
                    </div>
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