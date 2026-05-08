<script setup>
const config = useRuntimeConfig()

// Fetch all approved mitra
const { data: response, pending, error, refresh } = await useFetch(`${config.public.apiBase}/mitra`)

const mitras = computed(() => {
  if (response.value?.success && response.value.data?.length > 0) {
    return response.value.data
  }
  return []
})

// Search & Filtering
const searchTerm = ref('')
const filteredMitras = computed(() => {
  if (!searchTerm.value.trim()) return mitras.value
  const term = searchTerm.value.toLowerCase()
  return mitras.value.filter(m =>
    m.shopName.toLowerCase().includes(term) || m.address.toLowerCase().includes(term)
  )
})
</script>

<template>
  <div class="min-h-screen bg-gray-50/30 pb-20">
    <!-- Header Hero -->
    <div class="bg-navy py-20 px-4 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-[100px]"></div>
      </div>
      
      <div class="max-w-7xl mx-auto text-center relative z-10 space-y-8">
        <h1 class="text-4xl md:text-6xl font-black text-white tracking-tight">Eksplorasi <span class="text-primary-400">Rental PS</span></h1>
        <p class="text-primary-100/60 max-w-2xl mx-auto font-medium text-lg">Temukan tempat mabar terbaik dengan fasilitas premium dan unit PlayStation terbaru di sekitarmu.</p>
        
        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto relative group">
          <Icon name="heroicons:magnifying-glass" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-primary-500 transition-colors" />
          <input 
            v-model="searchTerm"
            type="text" 
            placeholder="Cari nama rental atau lokasi..." 
            class="w-full bg-white/10 border-2 border-white/10 rounded-[32px] pl-16 pr-8 py-6 text-white font-bold focus:outline-none focus:border-primary-500 focus:bg-white focus:text-navy transition-all backdrop-blur-xl shadow-2xl"
          >
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div v-for="i in 6" :key="i" class="bg-white rounded-[40px] p-4 border border-gray-100 animate-pulse">
          <div class="h-64 bg-gray-100 rounded-[32px] mb-6"></div>
          <div class="space-y-4 px-4">
            <div class="h-8 bg-gray-100 rounded-xl w-3/4"></div>
            <div class="h-4 bg-gray-100 rounded-lg w-1/2"></div>
            <div class="pt-6 flex justify-between">
              <div class="h-10 bg-gray-100 rounded-xl w-32"></div>
              <div class="h-10 w-10 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-[48px] p-20 text-center border border-red-100 shadow-xl shadow-red-900/5">
        <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:exclamation-triangle" class="w-10 h-10 text-red-500" />
        </div>
        <h3 class="text-2xl font-black text-navy">Koneksi Terputus</h3>
        <p class="text-gray-500 mt-2 font-medium">Gagal mengambil data mitra. Silakan periksa koneksi internet Anda.</p>
        <button @click="refresh()" class="mt-8 bg-navy text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-primary-500 hover:text-navy transition-all">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMitras.length === 0" class="bg-white rounded-[48px] p-24 text-center border border-gray-100 shadow-xl shadow-navy/5">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Icon name="heroicons:magnifying-glass" class="w-12 h-12 text-gray-200" />
        </div>
        <h3 class="text-2xl font-black text-navy">Tidak Ada Hasil</h3>
        <p class="text-gray-500 mt-2 font-medium max-w-sm mx-auto">Kami tidak dapat menemukan mitra dengan kata kunci tersebut. Coba kata kunci lain atau hapus filter.</p>
        <button @click="searchTerm = ''" class="mt-8 text-primary-600 font-black uppercase tracking-widest text-xs hover:text-navy transition-colors">
          Reset Pencarian
        </button>
      </div>

      <!-- Grid List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div v-for="mitra in filteredMitras" :key="mitra.id" class="group bg-white rounded-[40px] p-4 border border-gray-100 hover:border-primary-200 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-900/10">
          <!-- Image Container -->
          <div class="relative h-72 rounded-[32px] overflow-hidden">
            <img 
              :src="mitra.photos?.find(p => p.isMain)?.photoUrl || mitra.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=800&auto=format&fit=crop'" 
              :alt="mitra.shopName"
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            >
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl flex items-center shadow-lg">
              <Icon name="heroicons:star-solid" class="text-yellow-400 w-5 h-5 mr-1.5" />
              <span class="text-sm font-black text-navy">{{ mitra.avgRating || 'New' }}</span>
              <span class="text-[10px] text-gray-400 ml-1 font-bold">({{ mitra.reviewsCount || 0 }})</span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-6">
            <h3 class="text-2xl font-black text-navy mb-2 group-hover:text-primary-600 transition-colors">{{ mitra.shopName }}</h3>
            <p class="text-gray-500 text-sm font-medium flex items-start mb-6">
              <Icon name="heroicons:map-pin" class="w-4 h-4 mr-2 text-primary-500 shrink-0 mt-0.5" />
              <span class="line-clamp-1">{{ mitra.address }}</span>
            </p>
            
            <div class="flex justify-between items-center pt-6 border-t border-gray-50">
              <div>
                <p class="text-[10px] text-primary-400 uppercase font-black tracking-[0.2em] mb-1">Mulai Dari</p>
                <p class="text-2xl font-black text-navy">
                  Rp{{ (mitra.minPrice || 0).toLocaleString() }}<span class="text-sm font-medium text-gray-400 ml-1">/jam</span>
                </p>
              </div>
              <NuxtLink 
                :to="`/mitra/${mitra.id}`"
                class="bg-navy text-white p-4 rounded-2xl hover:bg-primary-500 hover:text-navy transition-all duration-300 shadow-lg shadow-navy/10 active:scale-90"
              >
                <Icon name="heroicons:arrow-right-20-solid" class="w-6 h-6" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
