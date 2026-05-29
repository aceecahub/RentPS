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

// Scroll detection untuk navbar
const { y: scrollY } = useWindowScroll()
const isScrolled = computed(() => scrollY.value > 20)
</script>

<<template>
  <div class="min-h-screen bg-white antialiased">
    <!-- Header -->
    <div class="bg-navy pt-24 pb-16 lg:px-20">
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 32px 32px;" />
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <h1 class="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Temukan Rental PS Terdekat
          </h1>
          <p class="text-slate-300 text-base font-medium mt-3 leading-relaxed">
            Jelajahi mitra rental PlayStation terkurasi dengan fasilitas premium di kota Anda.
          </p>
        </div>

        <!-- Search -->
        <div class="mt-8 max-w-xl">
          <div class="bg-white rounded-xl shadow-lg flex items-center px-4 py-3 border border-slate-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <Icon name="heroicons:magnifying-glass-20-solid" class="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input 
              v-model="searchTerm"
              type="text" 
              placeholder="Cari nama rental atau lokasi..." 
              class="flex-1 bg-transparent border-none outline-none px-3 text-navy placeholder:text-slate-400 text-sm font-medium"
            >
            <button v-if="searchTerm" @click="searchTerm = ''" class="p-1 hover:bg-slate-100 rounded-md transition-colors">
              <Icon name="heroicons:x-mark-20-solid" class="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      
      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl overflow-hidden border border-slate-100 animate-pulse">
          <div class="h-48 bg-slate-100"></div>
          <div class="p-5 space-y-3">
            <div class="h-5 bg-slate-100 rounded-lg w-3/4"></div>
            <div class="h-4 bg-slate-100 rounded-lg w-1/2"></div>
            <div class="pt-3 flex justify-between items-center">
              <div class="h-6 bg-slate-100 rounded-lg w-24"></div>
              <div class="w-9 h-9 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-lg mx-auto text-center py-16 bg-red-50 rounded-2xl border border-red-100">
        <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:exclamation-triangle-20-solid" class="w-7 h-7 text-red-500" />
        </div>
        <h3 class="text-lg font-black text-red-900">Koneksi Terputus</h3>
        <p class="text-red-600/70 text-sm font-medium mt-1">Gagal mengambil data mitra. Silakan periksa koneksi internet Anda.</p>
        <button @click="refresh()" class="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all text-sm">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMitras.length === 0" class="max-w-lg mx-auto text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div class="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:magnifying-glass-20-solid" class="w-7 h-7 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-slate-700">Tidak Ada Hasil</h3>
        <p class="text-slate-500 text-sm font-medium mt-1">Kami tidak dapat menemukan mitra dengan kata kunci tersebut.</p>
        <button @click="searchTerm = ''" class="mt-5 text-primary-600 font-bold hover:text-primary-700 transition-colors text-sm flex items-center gap-1.5 mx-auto">
          <Icon name="heroicons:arrow-path-20-solid" class="w-4 h-4" />
          Reset Pencarian
        </button>
      </div>

      <!-- Grid List -->
      <div v-else>
        <div class="flex items-center justify-between mb-8">
          <p class="text-sm text-slate-500 font-medium">
            Menampilkan <span class="text-navy font-bold">{{ filteredMitras.length }}</span> mitra
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="mitra in filteredMitras" 
            :key="mitra.id" 
            class="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary-200 transition-all duration-300 hover:shadow-md"
          >
            <!-- Image -->
            <div class="relative h-48 overflow-hidden">
              <img 
                :src="mitra.photos?.find(p => p.isMain)?.photoUrl || mitra.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=800&auto=format&fit=crop'" 
                :alt="mitra.shopName"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
              
              <!-- Rating -->
              <div class="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg flex items-center shadow-sm">
                <Icon name="heroicons:star-solid" class="text-yellow-400 w-3.5 h-3.5 mr-1" />
                <span class="text-sm font-bold text-navy">{{ mitra.avgRating || 'New' }}</span>
                <span class="text-[10px] text-slate-400 ml-0.5">({{ mitra.reviewsCount || 0 }})</span>
              </div>
            </div>

            <!-- Info -->
            <div class="p-5">
              <h3 class="text-base font-bold text-navy mb-1 group-hover:text-primary-600 transition-colors truncate">
                {{ mitra.shopName }}
              </h3>
              <p class="text-slate-500 text-sm font-medium flex items-start mb-4">
                <Icon name="heroicons:map-pin-20-solid" class="w-4 h-4 mr-1.5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span class="line-clamp-1">{{ mitra.address }}</span>
              </p>
              
              <div class="flex justify-between items-center pt-4 border-t border-slate-50">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Mulai dari</p>
                  <p class="text-lg font-black text-navy">
                    Rp{{ (mitra.minPrice || 0).toLocaleString() }}<<span class="text-sm font-medium text-slate-400">/jam</span>
                  </p>
                </div>
                <NuxtLink 
                  :to="`/mitra/${mitra.id}`"
                  class="bg-navy hover:bg-primary-600 text-white p-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center"
                >
                  <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>