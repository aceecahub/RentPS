<script setup>
const config = useRuntimeConfig()

// Fetch real data from backend
const { data: response, pending, error, refresh } = await useFetch(`${config.public.apiBase}/mitra`)

const mitras = computed(() => {
  if (response.value?.success && response.value.data?.length > 0) {
    return response.value.data.map(m => ({
      id: m.id,
      shopName: m.shopName,
      address: m.address,
      identityPhoto: m.photos?.find(p => p.isMain)?.photoUrl || m.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=800&auto=format&fit=crop',
      rating: m.avgRating || 0,
      reviewsCount: m.reviewsCount || 0,
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

const features = [
  { title: 'Booking Instan', description: 'Pesan kursi PS favoritmu hanya dalam hitungan detik tanpa perlu antre.', icon: 'heroicons:bolt-20-solid', color: 'bg-orange-500' },
  { title: 'Update Real-time', description: 'Lihat ketersediaan unit PS secara langsung di setiap mitra kami.', icon: 'heroicons:clock-20-solid', color: 'bg-blue-500' },
  { title: 'Mitra Terpercaya', description: 'Hanya bekerja sama dengan rental PS yang memiliki rating terbaik.', icon: 'heroicons:shield-check-20-solid', color: 'bg-green-500' },
  { title: 'Harga Transparan', description: 'Tidak ada biaya tersembunyi. Bayar sesuai durasi yang kamu pilih.', icon: 'heroicons:banknotes-20-solid', color: 'bg-purple-500' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section class="relative h-[650px] flex items-center justify-center overflow-hidden">
      <!-- Background with Identity Gradient -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2000&auto=format&fit=crop" 
          class="w-full h-full object-cover scale-105"
          alt="Gaming Background"
        >
      </div>
      
      <div class="relative z-20 text-left px-4 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        <div class="space-y-8 animate-fade-in-up">
          <div class="inline-flex items-center space-x-2 px-4 py-2 bg-primary-400/20 backdrop-blur-md border border-primary-400/30 rounded-full">
            <span class="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
            <span class="text-primary-100 text-xs font-bold uppercase tracking-widest">Platform Booking PS No. 1</span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
            Level Up Your <br> 
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-white">Gaming Experience</span>
          </h1>
          
          <p class="text-xl text-primary-100/80 max-w-xl font-medium leading-relaxed">
            Temukan rental PS terdekat dengan fasilitas terbaik. Cek unit, booking waktu, dan nikmati keseruannya sekarang juga.
          </p>
          
          <!-- Modern Search Bar -->
          <div class="bg-white/10 backdrop-blur-xl p-2 rounded-3xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-3 max-w-2xl group transition-all hover:border-primary-400/50">
            <div class="flex-grow flex items-center px-5 py-4 bg-white/5 rounded-2xl border border-white/5 transition-all group-focus-within:bg-white group-focus-within:border-white">
              <Icon name="heroicons:magnifying-glass" class="text-primary-300 w-6 h-6 mr-4 transition-colors group-focus-within:text-navy" />
              <input 
                v-model="searchTerm"
                type="text" 
                placeholder="Cari lokasi atau nama mitra..." 
                class="bg-transparent focus:ring-0 w-full text-white group-focus-within:text-navy placeholder-primary-300 group-focus-within:placeholder-gray-400 font-bold text-lg outline-none"
              >
            </div>
            <button class="bg-primary-500 hover:bg-primary-400 text-navy px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center space-x-2">
              <span>Cari Mitra</span>
              <Icon name="heroicons:arrow-right-20-solid" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="hidden lg:block relative">
          <!-- Decorative Floating Elements -->
          <div class="absolute -top-10 -right-10 w-64 h-64 bg-primary-500/20 blur-[100px] rounded-full"></div>
          <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-navy blur-[100px] rounded-full"></div>
          
          <div class="relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[40px] shadow-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=1000&auto=format&fit=crop" 
              alt="Console" 
              class="rounded-[24px] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700"
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="relative z-30 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="feature in features" 
          :key="feature.title"
          class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-all duration-300 group"
        >
          <div :class="[feature.color, 'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-12 transition-transform']">
            <Icon :name="feature.icon" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-black text-navy mb-3">{{ feature.title }}</h3>
          <p class="text-gray-500 text-sm font-medium leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Partners List -->
    <section id="mitra-list" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
      <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="w-12 h-1 bg-primary-500 rounded-full"></div>
            <span class="text-primary-600 font-black uppercase tracking-widest text-xs">Pilihan Gamers</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-navy leading-tight">Mitra Rental Pilihan</h2>
          <p class="text-gray-500 font-medium text-lg">Daftar mitra terpercaya dengan fasilitas dan unit terlengkap.</p>
        </div>
        <NuxtLink to="/mitra" class="group flex items-center space-x-3 bg-gray-50 hover:bg-navy hover:text-white px-8 py-4 rounded-2xl font-black transition-all">
          <span>Lihat Semua Mitra</span>
          <Icon name="heroicons:chevron-right" class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div v-for="i in 3" :key="i" class="bg-gray-50 rounded-[40px] overflow-hidden animate-pulse p-4">
          <div class="h-64 bg-gray-200 rounded-[32px] mb-6"></div>
          <div class="px-4 space-y-4 pb-4">
            <div class="h-8 bg-gray-200 rounded-xl w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div class="pt-6 border-t border-gray-100 flex justify-between">
              <div class="h-12 bg-gray-200 rounded-xl w-32"></div>
              <div class="h-12 w-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-24 bg-red-50 rounded-[40px] border border-red-100">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:exclamation-circle" class="w-10 h-10 text-red-500" />
        </div>
        <h3 class="text-2xl font-black text-red-900">Oops! Gagal Memuat Data</h3>
        <p class="text-red-600/70 mt-2 font-medium">Terjadi kesalahan saat menghubungkan ke server.</p>
        <button @click="refresh()" class="mt-8 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-red-200 transition-all">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="mitras.length === 0" class="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
        <Icon name="heroicons:inbox" class="w-20 h-20 text-gray-200 mx-auto mb-6" />
        <h3 class="text-2xl font-black text-gray-400">Belum Ada Mitra Terdaftar</h3>
        <p class="text-gray-400 mt-2 font-medium">Jadilah yang pertama mendaftar sebagai mitra rental!</p>
      </div>

      <!-- Data List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div v-for="mitra in filteredMitras" :key="mitra.id" class="group relative bg-white rounded-[40px] p-4 border border-gray-100 hover:border-primary-200 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-900/10">
          <!-- Thumbnail Container -->
          <div class="relative h-72 overflow-hidden rounded-[32px]">
            <img 
              :src="mitra.identityPhoto" 
              :alt="mitra.shopName"
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl flex items-center shadow-lg">
              <Icon name="heroicons:star-solid" class="text-yellow-400 w-5 h-5 mr-1.5" />
              <span class="text-sm font-black text-navy">{{ mitra.rating }}</span>
            </div>
          </div>

          <!-- Info Section -->
          <div class="p-6">
            <h3 class="text-2xl font-black text-navy mb-2 group-hover:text-primary-600 transition-colors">
              {{ mitra.shopName }}
            </h3>
            <p class="text-gray-500 text-sm font-medium flex items-center mb-6">
              <Icon name="heroicons:map-pin" class="w-4 h-4 mr-2 text-primary-500" />
              <span class="truncate">{{ mitra.address }}</span>
            </p>
            
            <div class="flex justify-between items-center pt-6 border-t border-gray-50">
              <div>
                <p class="text-[10px] text-primary-400 uppercase font-black tracking-[0.2em] mb-1">Mulai Dari</p>
                <p class="text-2xl font-black text-navy">
                  Rp{{ mitra.minPrice.toLocaleString() }}<span class="text-sm font-medium text-gray-400 ml-1">/jam</span>
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
    </section>

    <!-- Call to Action -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      <div class="relative bg-navy rounded-[48px] p-12 md:p-20 overflow-hidden group">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 blur-[120px] rounded-full transition-all duration-700 group-hover:bg-primary-500/30"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-400/10 blur-[100px] rounded-full"></div>
        
        <div class="relative z-10 text-center space-y-8 max-w-3xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-black text-white leading-tight">Punya Rental PS? <br> Bergabunglah Sekarang!</h2>
          <p class="text-xl text-primary-100/70 font-medium">Kelola rentalmu dengan sistem booking digital dan jangkau lebih banyak pelanggan di seluruh Indonesia.</p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <NuxtLink to="/auth/register" class="w-full sm:w-auto bg-primary-500 hover:bg-primary-400 text-navy px-12 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-primary-500/20">
              Daftar Sebagai Mitra
            </NuxtLink>
            <NuxtLink to="/mitra" class="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-2xl font-black border border-white/10 backdrop-blur-md transition-all">
              Pelajari Lebih Lanjut
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
