<script setup>
const config = useRuntimeConfig()

// Fetch real data from backend
const { data: response, pending, error } = await useFetch(`${config.public.apiBase}/mitra`)

const mitras = computed(() => {
  if (response.value?.success && response.value.data?.length > 0) {
    return response.value.data.map(m => ({
      id: m.id,
      shopName: m.shopName,
      address: m.address,
      identityPhoto: m.photos?.find(p => p.isMain)?.photoUrl || m.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=800&auto=format&fit=crop',
      rating: 4.8,
      reviewsCount: 124,
      minPrice: m.minPrice || 0
    }))
  }
  return []
})

// Search
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
  <div class="space-y-12">
    <!-- Hero Section -->
    <section class="relative h-[500px] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2000&auto=format&fit=crop" 
          class="w-full h-full object-cover brightness-50"
          alt="Gaming Background"
        >
      </div>
      
      <div class="relative z-10 text-center text-white px-4 max-w-4xl">
        <h1 class="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Sewa PS Lebih Mudah, <br> <span class="text-primary-400">Main Kapan Saja.</span>
        </h1>
        <p class="text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
          Cari mitra rental PlayStation terdekat, cek ketersediaan kursi secara real-time, dan booking langsung tanpa ribet.
        </p>
        
        <!-- Search Bar -->
        <div class="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
          <div class="flex-grow flex items-center px-4 py-3 bg-gray-50 rounded-xl">
            <Icon name="heroicons:magnifying-glass" class="text-gray-400 w-5 h-5 mr-3" />
            <input 
              v-model="searchTerm"
              type="text" 
              placeholder="Cari lokasi atau nama mitra..." 
              class="bg-transparent focus:ring-0 w-full text-navy placeholder-gray-400 font-medium"
            >
          </div>
          <button class="bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg">
            Cari Sekarang
          </button>
        </div>
      </div>
    </section>

    <!-- Partners List -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-3xl font-bold text-navy">Mitra Rental Pilihan</h2>
          <p class="text-gray-500 mt-2">Daftar mitra terpercaya dengan fasilitas terbaik</p>
        </div>
        <NuxtLink to="/mitra" class="text-navy font-semibold hover:underline flex items-center">
          Lihat Semua <Icon name="heroicons:chevron-right" class="ml-1 w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="card overflow-hidden animate-pulse">
          <div class="h-56 bg-gray-200"></div>
          <div class="p-6 space-y-4">
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="pt-4 border-t border-gray-50 flex justify-between">
              <div class="h-10 bg-gray-200 rounded w-24"></div>
              <div class="h-10 w-10 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-red-600">Gagal Memuat Data</h3>
        <p class="text-red-500 mt-2">Terjadi kesalahan saat menghubungi server.</p>
        <button @click="refresh()" class="mt-6 btn-primary">Coba Lagi</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="mitras.length === 0" class="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <Icon name="heroicons:inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-500">Belum Ada Mitra Terdaftar</h3>
        <p class="text-gray-400 mt-2">Silakan mendaftar sebagai mitra untuk tampil di sini.</p>
      </div>

      <!-- Data List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="mitra in filteredMitras" :key="mitra.id" class="card group cursor-pointer overflow-hidden">
          <!-- Thumbnail -->
          <div class="relative h-56 overflow-hidden">
            <img 
              :src="mitra.identityPhoto" 
              :alt="mitra.shopName"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            >
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center shadow-sm">
              <Icon name="heroicons:star-solid" class="text-yellow-400 w-4 h-4 mr-1" />
              <span class="text-sm font-bold text-navy">{{ mitra.rating }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-navy mb-1 group-hover:text-primary-600 transition-colors">
              {{ mitra.shopName }}
            </h3>
            <p class="text-gray-500 text-sm flex items-center mb-4">
              <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1 shrink-0" />
              <span class="truncate">{{ mitra.address }}</span>
            </p>
            
            <div class="flex justify-between items-center pt-4 border-t border-gray-50">
              <div>
                <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Mulai dari</p>
                <p class="text-xl font-black text-navy">Rp{{ mitra.minPrice.toLocaleString() }}<span class="text-sm font-normal text-gray-500">/jam</span></p>
              </div>
              <NuxtLink 
                :to="`/mitra/${mitra.id}`"
                class="bg-gray-100 group-hover:bg-navy group-hover:text-white p-3 rounded-xl transition-all duration-300"
              >
                <Icon name="heroicons:arrow-right" class="w-5 h-5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
