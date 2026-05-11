<script setup>
const config = useRuntimeConfig()

// Fetch all approved mitra
const { data: response, pending, error, refresh } = await useFetch(`${config.public.apiBase}/mitra`, {
  key: 'mitra-list-page',
  headers: useRequestHeaders(['cookie'])
})

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

// Stagger animation helper
const getDelay = (index) => {
  return `${index * 0.08}s`
}
</script>

<template>
  <div class="min-h-screen bg-primary-50/50">
    
    <!-- Header Hero -->
    <div class="relative bg-navy overflow-hidden">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <img src="data:image/jpeg;base64,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" alt=""
         class="w-full h-full object-cover opacity-40">
        <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-30%] right-[-5%] w-[500px] h-[500px] bg-primary-400/15 rounded-full blur-[100px] animate-pulse-slow" style="animation-delay: 2s;"></div>
        <div class="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-primary-300/10 rounded-full blur-[80px] animate-float-slow"></div>
      </div>
      
      <!-- Grid Pattern Overlay -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div class="text-center max-w-3xl mx-auto">
          <!-- Title -->
          <h1 class="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 animate-fade-in-up" style="animation-delay: 0.1s;">
            Eksplorasi <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300">Rental PS</span>
          </h1>
          
          <!-- Subtitle -->
          <p class="text-lg md:text-xl text-primary-200/70 max-w-xl mx-auto mb-12 font-medium leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s;">
            Temukan tempat mabar terbaik dengan fasilitas premium dan unit PlayStation terbaru di sekitarmu
          </p>
          
          <!-- Search Bar -->
          <div class="relative max-w-2xl mx-auto animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-primary-300/20 rounded-3xl blur-xl transform scale-105"></div>
            <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-elevated border border-white/20 overflow-hidden group focus-within:shadow-glow transition-shadow duration-500">
              <div class="flex items-center px-6 py-5">
                <Icon name="heroicons:magnifying-glass" class="w-6 h-6 text-primary-400 shrink-0 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  v-model="searchTerm"
                  type="text" 
                  placeholder="Cari nama rental atau lokasi..." 
                  class="flex-1 bg-transparent border-none outline-none px-4 text-navy placeholder:text-primary-300 text-lg font-medium"
                >
                <div v-if="searchTerm" @click="searchTerm = ''" class="cursor-pointer p-2 hover:bg-primary-50 rounded-full transition-colors">
                  <Icon name="heroicons:x-mark" class="w-5 h-5 text-primary-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Curve -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" class="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(240 244 248 / 0.5)"/>
        </svg>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
      
      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 6" :key="i" class="bg-white rounded-3xl overflow-hidden border border-primary-100/50 shadow-soft">
          <div class="h-56 bg-primary-50 animate-pulse"></div>
          <div class="p-6 space-y-4">
            <div class="h-6 bg-primary-50 rounded-lg w-3/4 animate-pulse"></div>
            <div class="h-4 bg-primary-50 rounded-lg w-1/2 animate-pulse"></div>
            <div class="pt-4 flex justify-between items-center">
              <div class="h-8 bg-primary-50 rounded-lg w-28 animate-pulse"></div>
              <div class="h-10 w-10 bg-primary-50 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-3xl p-16 text-center border border-red-100 shadow-elevated max-w-2xl mx-auto">
        <div class="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:exclamation-triangle" class="w-10 h-10 text-red-500" />
        </div>
        <h3 class="text-2xl font-black text-navy mb-3">Koneksi Terputus</h3>
        <p class="text-primary-400 font-medium mb-8 max-w-sm mx-auto">Gagal mengambil data mitra. Silakan periksa koneksi internet Anda.</p>
        <button @click="refresh()" class="bg-navy text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMitras.length === 0" class="bg-white rounded-3xl p-20 text-center border border-primary-100 shadow-elevated max-w-2xl mx-auto">
        <div class="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Icon name="heroicons:magnifying-glass" class="w-12 h-12 text-primary-300" />
        </div>
        <h3 class="text-2xl font-black text-navy mb-3">Tidak Ada Hasil</h3>
        <p class="text-primary-400 font-medium mb-8 max-w-sm mx-auto">Kami tidak dapat menemukan mitra dengan kata kunci tersebut.</p>
        <button @click="searchTerm = ''" class="text-primary-600 font-bold hover:text-navy transition-colors flex items-center gap-2 mx-auto">
          <Icon name="heroicons:arrow-path" class="w-4 h-4" />
          Reset Pencarian
        </button>
      </div>

      <!-- Grid List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(mitra, index) in filteredMitras" 
          :key="mitra.id" 
          class="group bg-white rounded-3xl overflow-hidden border border-primary-100/50 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-500 animate-fade-in-up"
          :style="{ animationDelay: getDelay(index) }"
        >
          <!-- Image Container -->
          <div class="relative h-60 overflow-hidden">
            <img 
              :src="mitra.photos?.find(p => p.isMain)?.photoUrl || mitra.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=800&auto=format&fit=crop'" 
              :alt="mitra.shopName"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            >
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Rating Badge -->
            <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl flex items-center shadow-lg border border-white/50">
              <Icon name="heroicons:star-solid" class="text-amber-400 w-4 h-4 mr-1.5" />
              <span class="text-sm font-black text-navy">{{ mitra.avgRating || 'New' }}</span>
              <span class="text-xs text-primary-400 ml-1 font-semibold">({{ mitra.reviewsCount || 0 }})</span>
            </div>
            
            <!-- Hover Action -->
            <div class="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <NuxtLink 
                :to="`/mitra/${mitra.id}`"
                class="bg-white text-navy px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg hover:bg-primary-500 hover:text-white transition-colors flex items-center gap-2"
              >
                Lihat Detail
                <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>

          <!-- Info -->
          <div class="p-6">
            <h3 class="text-xl font-black text-navy mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">{{ mitra.shopName }}</h3>
            <p class="text-primary-400 text-sm font-medium flex items-start mb-5">
              <Icon name="heroicons:map-pin" class="w-4 h-4 mr-2 text-primary-500 shrink-0 mt-0.5" />
              <span class="line-clamp-1">{{ mitra.address }}</span>
            </p>
            
            <div class="flex justify-between items-center pt-5 border-t border-primary-50">
              <div>
                <p class="text-[11px] text-primary-400 uppercase font-black tracking-[0.15em] mb-1">Mulai Dari</p>
                <p class="text-xl font-black text-navy">
                  Rp{{ (mitra.minPrice || 0).toLocaleString() }}<span class="text-sm font-medium text-primary-400 ml-1">/jam</span>
                </p>
              </div>
              <NuxtLink 
                :to="`/mitra/${mitra.id}`"
                class="bg-navy text-white p-3.5 rounded-2xl hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-lg shadow-navy/10 hover:shadow-primary-500/25 active:scale-90"
              >
                <Icon name="heroicons:arrow-right-20-solid" class="w-5 h-5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f0f4f8;
}
::-webkit-scrollbar-thumb {
  background: #bcccdc;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #9fb3c8;
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animation initial state fix */
.animate-fade-in-up {
  opacity: 0;
}
</style>
