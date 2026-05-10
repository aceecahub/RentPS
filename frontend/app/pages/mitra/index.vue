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
        <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-30%] right-[-5%] w-[500px] h-[500px] bg-primary-400/15 rounded-full blur-[100px] animate-pulse-slow" style="animation-delay: 2s;"></div>
        <div class="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-primary-300/10 rounded-full blur-[80px] animate-float-slow"></div>
      </div>
      
      <!-- Grid Pattern Overlay -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div class="text-center max-w-3xl mx-auto">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span class="text-primary-200 text-sm font-semibold tracking-wide">{{ mitras.length }} Rental Tersedia</span>
          </div>
          
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
