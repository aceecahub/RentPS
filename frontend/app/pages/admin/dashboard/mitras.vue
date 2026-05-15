
<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()


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
    APPROVED: 'bg-green-50 text-green-600 border-green-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    REJECTED: 'bg-red-50 text-red-600 border-red-100'
  }
  return map[status] || 'bg-gray-50 text-gray-600 border-gray-100'
}

const formatDay = (day) => {
  const map = { MONDAY: 'Senin', TUESDAY: 'Selasa', WEDNESDAY: 'Rabu', THURSDAY: 'Kamis', FRIDAY: 'Jumat', SATURDAY: 'Sabtu', SUNDAY: 'Minggu' }
  return map[day] || day
}
</script>

<template>
  <div class="p-4 md:p-10 min-h-screen bg-gray-50/30" @click.self="closeDetail">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
      <div>
        <h1 class="text-2xl md:text-4xl font-black text-navy tracking-tight">Manajemen Mitra</h1>
        <p class="text-gray-500 font-medium mt-1 text-sm md:text-base">Kelola dan pantau semua mitra rental PS yang terdaftar.</p>
      </div>
      <NuxtLink to="/admin/dashboard" class="group bg-white border-2 border-gray-100 text-navy px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-sm hover:border-navy transition-all flex items-center shadow-sm">
        <Icon name="heroicons:arrow-left-20-solid" class="mr-2 w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
        Kembali
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-3 md:gap-4 mb-8 md:mb-10">
      <div class="relative flex-grow">
        <Icon name="heroicons:magnifying-glass-20-solid" class="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama toko, pemilik, atau alamat..."
          class="w-full bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl pl-11 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-navy font-bold focus:outline-none focus:border-primary-500 transition-all shadow-sm text-sm md:text-base"
        >
      </div>
      <div class="flex gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
        <button
          v-for="status in ['', 'APPROVED', 'PENDING', 'REJECTED']"
          :key="status"
          @click="filterStatus = status; refresh()"
          class="px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all border whitespace-nowrap flex-shrink-0"
          :class="filterStatus === status ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20' : 'bg-white text-gray-400 border-gray-100 hover:border-navy hover:text-navy'"
        >
          {{ status || 'Semua' }}
        </button>
      </div>
    </div>

    <!-- Main layout with optional detail panel -->
    <div class="flex flex-col lg:flex-row gap-6 md:gap-8">
      <!-- Mitra List -->
      <div class="flex-grow min-w-0">
        <div v-if="pending" class="space-y-3 md:space-y-4">
          <div v-for="i in 5" :key="i" class="h-24 md:h-28 bg-white rounded-2xl md:rounded-[32px] border border-gray-100 animate-pulse"></div>
        </div>

        <div v-else-if="filteredMitras.length === 0" class="text-center py-20 md:py-32 bg-white rounded-3xl md:rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5">
          <div class="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
            <Icon name="heroicons:building-storefront" class="w-8 h-8 md:w-12 md:h-12 text-gray-200" />
          </div>
          <h3 class="text-xl md:text-2xl font-black text-navy mb-2 md:mb-3 tracking-tight">Tidak Ada Mitra</h3>
          <p class="text-gray-500 font-medium text-sm md:text-base">Belum ada mitra yang sesuai filter yang dipilih.</p>
        </div>

        <div v-else class="space-y-3 md:space-y-4">
          <div
            v-for="mitra in filteredMitras"
            :key="mitra.id"
            @click="openDetail(mitra.id)"
            class="group bg-white rounded-2xl md:rounded-[32px] border-2 transition-all duration-300 cursor-pointer overflow-hidden relative shadow-sm"
            :class="selectedMitra?.id === mitra.id
              ? 'border-primary-500 shadow-xl shadow-primary-500/10'
              : 'border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-navy/5'"
          >
            <div class="absolute right-0 top-0 h-full w-1.5 md:w-2 transition-all"
              :class="selectedMitra?.id === mitra.id ? 'bg-primary-500' : 'bg-transparent group-hover:bg-gray-100'">
            </div>
            <div class="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
              <div class="flex items-center space-x-3 md:space-x-5 w-full md:w-auto">
                <div class="relative flex-shrink-0">
                  <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img
                      v-if="mitra.photos?.find(p => p.isMain)?.photoUrl"
                      :src="mitra.photos.find(p => p.isMain).photoUrl"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <Icon name="heroicons:building-storefront-20-solid" class="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
                    </div>
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white"
                    :class="{
                      'bg-green-500': mitra.approvalStatus === 'APPROVED',
                      'bg-amber-500': mitra.approvalStatus === 'PENDING',
                      'bg-red-500': mitra.approvalStatus === 'REJECTED'
                    }">
                  </div>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base md:text-xl font-black text-navy tracking-tight group-hover:text-primary-600 transition-colors truncate">{{ mitra.shopName }}</h3>
                  <p class="text-xs md:text-sm font-bold text-gray-500 mt-0.5">{{ mitra.user?.name }}</p>
                  <div class="flex items-center text-xs text-gray-400 font-bold mt-1">
                    <Icon name="heroicons:map-pin-20-solid" class="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    <span class="truncate max-w-[200px] md:max-w-xs">{{ mitra.address }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-start">
                <span class="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border" :class="getStatusClass(mitra.approvalStatus)">
                  {{ mitra.approvalStatus }}
                </span>
                <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Side Panel -->
      <Transition name="slide-panel">
        <div v-if="selectedMitra || detailPending" class="w-full lg:w-[480px] shrink-0">
          <div class="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-2xl shadow-navy/10 lg:sticky lg:top-10 overflow-hidden max-h-[calc(100vh-80px)] flex flex-col">
            <!-- Panel Header -->
            <div class="p-5 md:p-8 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
              <h3 class="text-lg md:text-xl font-black text-navy tracking-tight">Detail Mitra</h3>
              <button @click="closeDetail" class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Icon name="heroicons:x-mark-20-solid" class="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="detailPending" class="flex-grow flex flex-col items-center justify-center p-12 md:p-20 space-y-4">
              <Icon name="svg-spinners:ring-resize" class="w-10 h-10 md:w-12 md:h-12 text-primary-500" />
              <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Memuat detail mitra...</p>
            </div>

            <!-- Content -->
            <div v-else-if="selectedMitra" class="flex-grow overflow-y-auto">
              <!-- Shop Info -->
              <div class="p-5 md:p-8 border-b border-gray-50">
                <div class="flex items-start space-x-4 md:space-x-5">
                  <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                    <img v-if="selectedMitra.photos?.find(p => p.isMain)?.photoUrl" :src="selectedMitra.photos.find(p => p.isMain).photoUrl" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-navy">
                      <Icon name="heroicons:building-storefront-20-solid" class="w-8 h-8 md:w-10 md:h-10 text-primary-400/50" />
                    </div>
                  </div>
                  <div class="flex-grow min-w-0">
                    <h2 class="text-xl md:text-2xl font-black text-navy tracking-tight truncate">{{ selectedMitra.shopName }}</h2>
                    <p class="text-xs md:text-sm text-gray-500 font-bold mt-1 line-clamp-2">{{ selectedMitra.address }}</p>
                    <span class="inline-block mt-2 md:mt-3 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border" :class="getStatusClass(selectedMitra.approvalStatus)">
                      {{ selectedMitra.approvalStatus }}
                    </span>
                  </div>
                </div>
                <p v-if="selectedMitra.description" class="text-xs md:text-sm text-gray-500 font-medium mt-4 md:mt-5 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4 leading-relaxed">{{ selectedMitra.description }}</p>

                <!-- Rejection Reason if exists -->
                <div v-if="selectedMitra.rejectionReason && selectedMitra.approvalStatus === 'REJECTED'" class="mt-4 md:mt-5 p-3 md:p-4 bg-red-50 border border-red-100 rounded-xl md:rounded-2xl">
                  <p class="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Alasan Penolakan Sebelumnya:</p>
                  <p class="text-xs md:text-sm text-red-600 font-bold leading-relaxed">{{ selectedMitra.rejectionReason }}</p>
                </div>

                <!-- Action Buttons -->
                <div v-if="selectedMitra.approvalStatus !== 'APPROVED'" class="flex gap-2 md:gap-3 mt-4 md:mt-5">
                  <button @click="approveMitra(selectedMitra.id)" class="flex-1 bg-navy text-white py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-navy transition-all shadow-lg shadow-navy/10 active:scale-95">
                    ✓ Approve
                  </button>
                  <button @click="rejectMitra(selectedMitra.id)" class="flex-1 bg-red-50 text-red-500 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 active:scale-95">
                    ✗ Tolak
                  </button>
                </div>
                <div v-else class="mt-4 md:mt-5">
                   <button @click="rejectMitra(selectedMitra.id)" class="w-full bg-gray-50 text-gray-400 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 active:scale-95">
                    ✗ Cabut Approval
                  </button>
                </div>


              </div>

              <!-- Units -->
              <div class="p-5 md:p-8 border-b border-gray-50">
                <div class="flex items-center space-x-3 mb-4 md:mb-5">
                  <div class="w-1.5 h-5 md:h-6 bg-primary-500 rounded-full"></div>
                  <h4 class="text-base md:text-lg font-black text-navy">Unit PlayStation</h4>
                  <span class="ml-auto bg-navy text-white text-[10px] md:text-xs font-black px-2.5 md:px-3 py-1 rounded-full">{{ selectedMitra.units?.length || 0 }}</span>
                </div>
                <div v-if="!selectedMitra.units?.length" class="text-center py-6 md:py-8 text-gray-400 text-xs md:text-sm font-bold">Belum ada unit terdaftar</div>
                <div v-else class="space-y-2 md:space-y-3">
                  <div v-for="unit in selectedMitra.units" :key="unit.id" class="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl">
                    <div class="flex items-center space-x-2 md:space-x-3">
                      <div class="w-8 h-8 md:w-10 md:h-10 bg-navy rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon :name="unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" class="w-4 h-4 md:w-5 md:h-5 text-primary-400" />
                      </div>
                      <div class="min-w-0">
                        <p class="font-black text-navy text-xs md:text-sm truncate">{{ unit.name }}</p>
                        <p class="text-[10px] md:text-xs text-primary-500 font-black uppercase">{{ unit.type }}</p>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0 ml-2">
                      <p class="font-black text-navy text-xs md:text-sm">Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}/h</p>
                      <span class="text-[9px] md:text-[10px] font-black uppercase" :class="unit.isAvailable ? 'text-green-500' : 'text-red-500'">
                        {{ unit.isAvailable ? 'Available' : 'Busy' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Snacks -->
              <div class="p-5 md:p-8 border-b border-gray-50">
                <div class="flex items-center space-x-3 mb-4 md:mb-5">
                  <div class="w-1.5 h-5 md:h-6 bg-primary-500 rounded-full"></div>
                  <h4 class="text-base md:text-lg font-black text-navy">Inventaris Snack</h4>
                  <span class="ml-auto bg-gray-100 text-gray-600 text-[10px] md:text-xs font-black px-2.5 md:px-3 py-1 rounded-full">{{ selectedMitra.snacks?.length || 0 }}</span>
                </div>
                <div v-if="!selectedMitra.snacks?.length" class="text-center py-6 md:py-8 text-gray-400 text-xs md:text-sm font-bold">Belum ada snack tersedia</div>
                <div v-else class="grid grid-cols-2 gap-2 md:gap-3">
                  <div v-for="snack in selectedMitra.snacks" :key="snack.id" class="bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-4">
                    <p class="font-black text-navy text-xs md:text-sm truncate">{{ snack.name }}</p>
                    <p class="text-primary-500 font-black text-xs md:text-sm mt-1">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-[9px] md:text-[10px] text-gray-400 font-black uppercase">Stok</span>
                      <span class="text-[9px] md:text-[10px] font-black" :class="snack.stock > 5 ? 'text-green-500' : 'text-red-500'">{{ snack.stock }} pcs</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Operating Hours -->
              <div class="p-5 md:p-8 border-b border-gray-50">
                <div class="flex items-center space-x-3 mb-4 md:mb-5">
                  <div class="w-1.5 h-5 md:h-6 bg-primary-500 rounded-full"></div>
                  <h4 class="text-base md:text-lg font-black text-navy">Jam Operasional</h4>
                </div>
                <div v-if="!selectedMitra.operatingHours?.length" class="text-center py-6 md:py-8 text-gray-400 text-xs md:text-sm font-bold">Jam operasional belum diatur</div>
                <div v-else class="space-y-1.5 md:space-y-2">
                  <div v-for="hour in selectedMitra.operatingHours" :key="hour.id" class="flex items-center justify-between py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl" :class="hour.isOpen ? 'bg-green-50' : 'bg-gray-50'">
                    <span class="font-black text-navy text-xs md:text-sm">{{ formatDay(hour.day) }}</span>
                    <span v-if="hour.isOpen" class="text-xs md:text-sm font-bold text-green-600">{{ hour.openTime }} – {{ hour.closeTime }}</span>
                    <span v-else class="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Libur</span>
                  </div>
                </div>
              </div>

              <!-- Gallery -->
              <div class="p-5 md:p-8">
                <div class="flex items-center space-x-3 mb-4 md:mb-5">
                  <div class="w-1.5 h-5 md:h-6 bg-primary-500 rounded-full"></div>
                  <h4 class="text-base md:text-lg font-black text-navy">Galeri Foto</h4>
                  <span class="ml-auto bg-gray-100 text-gray-600 text-[10px] md:text-xs font-black px-2.5 md:px-3 py-1 rounded-full">{{ selectedMitra.photos?.length || 0 }}</span>
                </div>
                <div v-if="!selectedMitra.photos?.length" class="text-center py-6 md:py-8 text-gray-400 text-xs md:text-sm font-bold">Belum ada foto diunggah</div>
                <div v-else class="grid grid-cols-2 gap-2 md:gap-3">
                  <div v-for="photo in selectedMitra.photos" :key="photo.id" class="aspect-square rounded-xl md:rounded-2xl overflow-hidden relative group">
                    <img :src="photo.photoUrl" :alt="photo.caption" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span v-if="photo.isMain" class="absolute top-2 left-2 bg-primary-500 text-navy text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg">Cover</span>
                  </div>
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