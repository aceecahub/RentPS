<script setup>
import { watchDebounced } from '@vueuse/core'
const config = useRuntimeConfig()

// Fetch data
const { data: response, pending, error, refresh } = await useFetch(`${config.public.apiBase}/mitra`, {
  key: 'home-mitra-list',
  headers: useRequestHeaders(['cookie'])
})

const mitras = computed(() => {
  if (response.value?.success && response.value.data?.length > 0) {
    return response.value.data.map(m => ({
      id: m.id,
      shopName: m.shopName,
      address: m.address,
      identityPhoto: m.photos?.find(p => p.isMain)?.photoUrl || m.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=800&auto=format&fit=crop',
      rating: m.avgRating || 0,
      reviewsCount: m.reviewsCount || 0,
      minPrice: m.minPrice || 0,
      isOpen: m.isOpen ?? true,
      distance: m.distance || null
    }))
  }
  return []
})

// Search dengan debounce
const searchTerm = ref('')
const debouncedSearch = ref('')
watchDebounced(searchTerm, (val) => debouncedSearch.value = val, { debounce: 300 })

const filteredMitras = computed(() => {
  if (!debouncedSearch.value.trim()) return mitras.value
  const term = debouncedSearch.value.toLowerCase()
  return mitras.value.filter(m =>
    m.shopName.toLowerCase().includes(term) || 
    m.address.toLowerCase().includes(term)
  )
})

// Scroll detection untuk header
const { y: scrollY } = useWindowScroll()
const isScrolled = computed(() => scrollY.value > 32)

const features = [
  { 
    title: 'Booking Instan', 
    description: 'Pesan kursi PS favoritmu hanya dalam hitungan detik tanpa perlu antre.', 
    icon: 'heroicons:bolt-20-solid', 
    color: 'from-primary-400 to-primary-600',
    delay: 0
  },
  { 
    title: 'Update Real-time', 
    description: 'Lihat ketersediaan unit PS secara langsung di setiap mitra kami.', 
    icon: 'heroicons:clock-20-solid', 
    color: 'from-primary-500 to-primary-700',
    delay: 100
  },
  { 
    title: 'Mitra Terpercaya', 
    description: 'Hanya bekerja sama dengan rental PS yang memiliki rating terbaik.', 
    icon: 'heroicons:shield-check-20-solid', 
    color: 'from-navy to-primary-800',
    delay: 200
  },
  { 
    title: 'Harga Transparan', 
    description: 'Tidak ada biaya tersembunyi. Bayar sesuai durasi yang kamu pilih.', 
    icon: 'heroicons:banknotes-20-solid', 
    color: 'from-primary-600 to-navy',
    delay: 300
  },
]

// Animated particles untuk background
const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 0.5,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 20
}))
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white overflow-x-hidden">
    
    <!-- ✨ Animated Background Particles -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div v-for="p in particles" :key="p.id"
        class="absolute rounded-full bg-primary-400/10 animate-float"
        :style="{
          width: `${p.size}rem`,
          height: `${p.size}rem`,
          left: `${p.left}%`,
          top: `${p.top}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`
        }"
      />
      <div class="absolute top-0 right-0 w-[700px] h-[700px] bg-primary-300/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
    </div>

    <!-- 🎮 Hero Section -->
    <section class="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-16">
      <!-- Background Layer -->
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2000&auto=format&fit=crop" 
          class="w-full h-full object-cover"
          alt="Gaming Setup"
        >
        <div class="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/90 to-navy/80" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/15 via-transparent to-transparent" />
      </div>
      
      <div class="relative z-20 px-4 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-14">
        <!-- Content -->
        <div class="space-y-7 animate-fade-in-up">
          <!-- Trust Badge -->
          <div class="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-400"></span>
            </span>
            <span class="text-white/90 text-xs font-bold uppercase tracking-wider">Platform #1 Indonesia</span>
          </div>
          
          <!-- Headline -->
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Level Up Your <br>
            <span class="relative inline-block">
              <span class="relative z-10 bg-gradient-to-r from-primary-300 via-primary-200 to-white bg-clip-text text-transparent">Gaming Experience</span>
              <span class="absolute -bottom-2 left-0 right-0 h-2.5 bg-primary-400/25 blur-lg rounded-full" />
            </span>
          </h1>
          
          <!-- Subheadline -->
          <p class="text-lg md:text-xl text-white/85 max-w-xl font-medium leading-relaxed">
            Temukan rental PS terdekat dengan fasilitas premium. Cek ketersediaan real-time, booking instan, dan mainkan keseruan tanpa batas.
          </p>
          
          <!-- Search Bar -->
          <div class="bg-white/10 backdrop-blur-2xl p-2 rounded-3xl border border-white/20 shadow-2xl shadow-black/20 flex flex-col sm:flex-row gap-2.5 max-w-2xl group transition-all duration-300 hover:border-primary-400/40">
            <div class="flex-grow flex items-center px-5 py-4 bg-white/5 rounded-2xl border border-white/10 transition-all focus-within:bg-white/10 focus-within:border-primary-400/50">
              <Icon name="heroicons:magnifying-glass-20-solid" class="text-primary-300 w-5 h-5 mr-3" />
              <input 
                v-model="searchTerm"
                type="text" 
                placeholder="Cari lokasi, nama rental, atau game..." 
                class="bg-transparent focus:ring-0 w-full text-white placeholder-white/50 font-medium text-base outline-none"
                @keyup.enter="$router.push({ path: '/mitra', query: { q: searchTerm } })"
              >
            </div>
            <button 
              @click="$router.push({ path: '/mitra', query: { q: searchTerm } })"
              class="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white px-7 py-4 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary-500/25 flex items-center justify-center space-x-2 min-w-[130px]"
            >
              <span>Cari</span>
              <Icon name="heroicons:arrow-right-20-solid" class="w-4.5 h-4.5" />
            </button>
          </div>
          
          <!-- Social Proof -->
          <div class="flex flex-wrap items-center gap-5 pt-3">
            <div class="flex items-center space-x-2">
              <div class="flex -space-x-2">
                <NuxtImg v-for="i in 4" :key="i" 
                  :src="`https://i.pravatar.cc/40?img=${i + 10}`" 
                  class="w-8 h-8 rounded-full border-2 border-navy"
                  alt="User"
                />
              </div>
              <span class="text-white/80 text-sm font-medium">10k+ Gamers</span>
            </div>
            <div class="flex items-center space-x-1">
              <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="w-4 h-4 text-yellow-400" />
              <span class="text-white/80 text-sm font-medium">4.9/5</span>
            </div>
          </div>
        </div>

        <!-- Hero Visual -->
        <div class="hidden lg:block relative">
          <div class="animate-float-slow">
            <div class="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-2.5 rounded-3xl shadow-2xl shadow-black/30">
              <NuxtImg 
                src="https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?q=80&w=1000&auto=format&fit=crop" 
                alt="PlayStation Console" 
                class="rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                width="500"
                height="400"
              />
              
              <!-- Floating Status -->
              <div class="absolute -top-3 -right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-white/50 animate-bounce-slow">
                <div class="flex items-center space-x-2">
                  <div class="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-500 font-medium">Tersedia</p>
                    <p class="text-sm font-black text-navy">PS5 • 4 Unit</p>
                  </div>
                </div>
              </div>
              
              <!-- Price Badge -->
              <div class="absolute bottom-3 left-3 bg-navy/95 backdrop-blur-md rounded-xl px-3.5 py-2 shadow-lg">
                <p class="text-[10px] text-white/70 font-medium">Mulai dari</p>
                <p class="text-base font-black text-white">Rp 25.000<span class="text-xs font-medium text-white/70">/jam</span></p>
              </div>
            </div>
          </div>
          
          <!-- Decorative Glow -->
          <div class="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-r from-primary-500/15 to-transparent blur-3xl rounded-full animate-pulse-slow" />
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div class="w-5 h-9 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
          <div class="w-1 h-2.5 bg-white/60 rounded-full animate-scroll-down" />
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

    <!-- 🎯 Partners Section -->
    <section id="mitra-list" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-5">
        <div class="space-y-3.5">
          <div class="flex items-center space-x-2">
            <div class="w-1.5 h-5 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full"></div>
            <span class="text-primary-600 font-black uppercase tracking-widest text-[10px]">Rekomendasi Terbaik</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-navy leading-tight">Mitra Rental Pilihan</h2>
          <p class="text-slate-500 font-medium text-lg max-w-2xl">Daftar mitra terpercaya dengan fasilitas premium dan unit terlengkap di kota Anda.</p>
        </div>
        <NuxtLink to="/mitra" class="group inline-flex items-center space-x-2 bg-gradient-to-r from-navy to-navy/95 hover:from-primary-500 hover:to-primary-600 text-white px-6 py-3.5 rounded-2xl font-black transition-all hover:shadow-lg hover:shadow-primary-500/20">
          <span>Lihat Semua</span>
          <Icon name="heroicons:arrow-long-right-20-solid" class="w-4.5 h-4.5 transform group-hover:translate-x-0.5 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        <div v-for="i in 3" :key="i" class="bg-white rounded-3xl overflow-hidden animate-pulse border border-slate-100">
          <div class="h-52 bg-slate-100"></div>
          <div class="p-5 space-y-4">
            <div class="h-5.5 bg-slate-100 rounded-xl w-3/4"></div>
            <div class="h-4 bg-slate-100 rounded-lg w-1/2"></div>
            <div class="pt-4 border-t border-slate-50 flex justify-between items-center">
              <div class="h-7 bg-slate-100 rounded-xl w-20"></div>
              <div class="w-11 h-11 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-5 text-center py-18 bg-gradient-to-br from-red-50 to-orange-50/30 rounded-3xl border border-red-100">
        <div class="w-15 h-15 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:exclamation-triangle-20-solid" class="w-7 h-7 text-red-500" />
        </div>
        <h3 class="text-lg font-black text-red-900">Gagal Memuat Data</h3>
        <p class="text-red-600/70 mt-1 font-medium">Silakan periksa koneksi internet Anda.</p>
        <button @click="refresh()" class="mt-5 bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-2xl font-black shadow-lg shadow-red-200 transition-all hover:scale-[1.02]">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMitras.length === 0" class="text-center py-20 bg-gradient-to-br from-slate-50 to-white rounded-3xl border-2 border-dashed border-slate-200">
        <div class="w-18 h-18 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:magnifying-glass-20-solid" class="w-9 h-9 text-slate-300" />
        </div>
        <h3 class="text-lg font-black text-slate-700">Tidak Ditemukan</h3>
        <p class="text-slate-500 mt-1 font-medium">Coba kata kunci pencarian lain atau jelajahi semua mitra.</p>
        <NuxtLink to="/mitra" class="mt-5 inline-flex items-center space-x-1.5 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
          <span>Lihat Semua Mitra</span>
          <Icon name="heroicons:arrow-long-right-20-solid" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Partner Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        <div 
          v-for="mitra in filteredMitras" 
          :key="mitra.id" 
          class="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-primary-200/60 transition-all duration-500 hover:shadow-elevated hover:-translate-y-1"
        >
          <!-- Image -->
          <div class="relative h-52 overflow-hidden">
            <NuxtImg 
              :src="mitra.identityPhoto" 
              :alt="mitra.shopName"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              width="400"
              height="300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/15 to-transparent opacity-90" />
            
            <!-- Status Badge -->
            <div class="absolute top-3.5 left-3.5">
              <span :class="['px-2.5 py-1.5 rounded-full text-[10px] font-black backdrop-blur-md border', mitra.isOpen ? 'bg-green-500/20 border-green-400/30 text-green-200' : 'bg-slate-500/20 border-slate-400/30 text-slate-200']">
                {{ mitra.isOpen ? '● Buka' : '○ Tutup' }}
              </span>
            </div>
            
            <!-- Rating -->
            <div class="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center shadow-lg">
              <Icon name="heroicons:star-solid" class="text-yellow-400 w-3.5 h-3.5 mr-1" />
              <span class="text-sm font-black text-navy">{{ mitra.rating }}</span>
              <span v-if="mitra.reviewsCount" class="text-[10px] text-slate-400 ml-0.5">({{ mitra.reviewsCount }})</span>
            </div>
            
            <!-- Distance -->
            <div v-if="mitra.distance" class="absolute bottom-3.5 left-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center shadow-lg">
              <Icon name="heroicons:map-pin-20-solid" class="text-primary-500 w-3.5 h-3.5 mr-1" />
              <span class="text-sm font-bold text-navy">{{ mitra.distance }} km</span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="text-lg font-black text-navy mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
              {{ mitra.shopName }}
            </h3>
            <p class="text-slate-500 text-sm font-medium flex items-center mb-4 line-clamp-1">
              <Icon name="heroicons:map-pin-20-solid" class="w-4 h-4 mr-1.5 text-primary-400 flex-shrink-0" />
              <span class="truncate">{{ mitra.address }}</span>
            </p>
            
            <div class="flex justify-between items-center pt-4 border-t border-slate-50">
              <div>
                <p class="text-[9px] text-primary-500 uppercase font-black tracking-[0.25em] mb-0.5">Mulai</p>
                <p class="text-xl font-black text-navy">
                  Rp{{ mitra.minPrice.toLocaleString('id-ID') }}<span class="text-sm font-medium text-slate-400">/jam</span>
                </p>
              </div>
              <NuxtLink 
                :to="`/mitra/${mitra.id}`"
                class="group/btn bg-gradient-to-r from-navy to-navy/95 hover:from-primary-500 hover:to-primary-600 text-white p-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-navy/10 hover:shadow-primary-500/25 active:scale-95 flex items-center justify-center"
              >
                <Icon name="heroicons:arrow-long-right-20-solid" class="w-4.5 h-4.5 transform group-hover/btn:translate-x-0.5 transition-transform" />
              </NuxtLink>
            </div>
          </div>
          
          <!-- Hover Glow -->
          <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      </div>
    </section>

    <!-- 🚀 CTA Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
      <div class="relative bg-gradient-to-br from-navy via-navy/95 to-navy rounded-3xl p-9 md:p-14 overflow-hidden group">
        <!-- Animated Blobs -->
        <div class="absolute -top-28 -right-28 w-72 h-72 bg-primary-500/20 blur-[90px] rounded-full animate-pulse-slow" />
        <div class="absolute -bottom-28 -left-28 w-72 h-72 bg-primary-400/15 blur-[90px] rounded-full animate-pulse-slow" style="animation-delay: 2s" />
        
        <div class="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
          <div class="inline-flex items-center space-x-2 px-3.5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mx-auto">
            <Icon name="heroicons:sparkles-20-solid" class="w-4 h-4 text-primary-300" />
            <span class="text-primary-100 text-[10px] font-bold uppercase tracking-wider">Untuk Pemilik Rental</span>
          </div>
          
          <h2 class="text-4xl md:text-5xl font-black text-white leading-tight">
            Punya Rental PS? <br>
            <span class="bg-gradient-to-r from-primary-300 to-white bg-clip-text text-transparent">Bergabung Sekarang!</span>
          </h2>
          
          <p class="text-lg text-primary-100/85 font-medium leading-relaxed">
            Kelola bisnis rental Anda dengan sistem booking digital modern. Jangkau ribuan gamer aktif di seluruh Indonesia.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1">
            <NuxtLink to="/auth/register?role=partner" class="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white px-9 py-4 rounded-2xl font-black transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2">
              <span>Daftar Gratis</span>
              <Icon name="heroicons:arrow-long-right-20-solid" class="w-4.5 h-4.5" />
            </NuxtLink>
            <NuxtLink to="/mitra/join" class="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-9 py-4 rounded-2xl font-black border border-white/20 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95">
              Pelajari Selengkapnya
            </NuxtLink>
          </div>
          
          <!-- Trust Badges -->
          <div class="flex flex-wrap items-center justify-center gap-5 pt-4 text-sm">
            <div class="flex items-center space-x-1.5 text-white/75">
              <Icon name="heroicons:check-circle-20-solid" class="w-4.5 h-4.5 text-green-400" />
              <span>Tanpa biaya pendaftaran</span>
            </div>
            <div class="flex items-center space-x-1.5 text-white/75">
              <Icon name="heroicons:check-circle-20-solid" class="w-4.5 h-4.5 text-green-400" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<style scoped>
/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Accessible focus */
:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>