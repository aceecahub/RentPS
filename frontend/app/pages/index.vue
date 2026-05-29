<script setup>
import { watchDebounced } from '@vueuse/core'
const config = useRuntimeConfig()

// Fetch data mitra
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
  if (!debouncedSearch.value.trim()) return mitras.value.slice(0, 6)
  const term = debouncedSearch.value.toLowerCase()
  return mitras.value.filter(m =>
    m.shopName.toLowerCase().includes(term) || 
    m.address.toLowerCase().includes(term)
  )
})

// Scroll detection untuk navbar
const { y: scrollY } = useWindowScroll()
const isScrolled = computed(() => scrollY.value > 20)

// Stats counter
const stats = [
  { value: '500+', label: 'Mitra Rental', sub: 'Di seluruh Indonesia' },
  { value: '50rb+', label: 'Booking Selesai', sub: 'Dengan rating puas' },
  { value: '4.9', label: 'Rating Rata-rata', sub: 'Dari 10.000+ review' },
  { value: '24/7', label: 'Support Aktif', sub: 'Siap membantu Anda' }
]

// How it works
const steps = [
  {
    number: '01',
    title: 'Cari Lokasi',
    desc: 'Temukan rental PS terdekat dengan fitur pencarian lokasi real-time.',
    icon: 'heroicons:magnifying-glass-20-solid'
  },
  {
    number: '02',
    title: 'Pilih Unit',
    desc: 'Lihat ketersediaan PS4/PS5 secara langsung dan pilih sesuai kebutuhan.',
    icon: 'heroicons:check-circle-20-solid'
  },
  {
    number: '03',
    title: 'Booking Instan',
    desc: 'Pesan slot waktu dengan pembayaran digital yang aman dan terjamin.',
    icon: 'heroicons:calendar-days-20-solid'
  }
]

// Testimonials
const testimonials = [
  {
    name: 'Rizky Aditya',
    role: 'Gamer Aktif',
    content: 'Platform paling reliable untuk booking rental PS. Status ketersediaan real-time benar-benar real-time, tidak pernah zonk.',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: 5
  },
  {
    name: 'Dewi Lestari',
    role: 'Pemilik Rental',
    content: 'Sejak bergabung, okupansi rental saya naik 40%. Sistem booking otomatis sangat membantu manajemen operasional.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Event Organizer',
    content: 'Sering booking untuk event komunitas. Prosesnya cepat, mitra-mitranya profesional, dan fasilitas selalu sesuai deskripsi.',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5
  }
]

// Trust badges
const trustBadges = [
  { icon: 'heroicons:shield-check-20-solid', title: 'Pembayaran Aman', desc: 'SSL Encrypted' },
  { icon: 'heroicons:lock-closed-20-solid', title: 'Data Terlindungi', desc: 'Privacy Protected' },
  { icon: 'heroicons:check-badge-20-solid', title: 'Mitra Terverifikasi', desc: 'Proses Kurasi Ketat' },
  { icon: 'heroicons:clock-20-solid', title: 'Konfirmasi Cepat', desc: '< 2 Menit' }
]

const features = [
  { 
    title: 'Booking Instan', 
    description: 'Pesan kursi PS favoritmu hanya dalam hitungan detik tanpa perlu antre.', 
    icon: 'heroicons:bolt-20-solid'
  },
  { 
    title: 'Update Real-time', 
    description: 'Lihat ketersediaan unit PS secara langsung di setiap mitra kami.', 
    icon: 'heroicons:clock-20-solid'
  },
  { 
    title: 'Mitra Terpercaya', 
    description: 'Hanya bekerja sama dengan rental PS yang memiliki rating terbaik.', 
    icon: 'heroicons:shield-check-20-solid'
  },
  { 
    title: 'Harga Transparan', 
    description: 'Tidak ada biaya tersembunyi. Bayar sesuai durasi yang kamu pilih.', 
    icon: 'heroicons:banknotes-20-solid'
  }
]
</script>

<<template>
  <div class="min-h-screen bg-white antialiased">
    <!-- Hero Section -->
    <section class="relative bg-navy overflow-hidden">
      <!-- Subtle background pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 32px 32px;" />
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div class="max-w-3xl">
          <!-- Badge -->
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 bg-primary-500/15 border border-primary-400/20 rounded-full mb-6">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-400"></span>
            </span>
            <span class="text-primary-300 text-xs font-bold uppercase tracking-wider">Platform Booking PS Terbesar di Indonesia</span>
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Rental PS Premium, <br>
            <span class="text-primary-400">Booking dalam Detik</span>
          </h1>
          
          <p class="text-lg text-slate-300 max-w-2xl leading-relaxed mb-8 font-medium">
            Temukan dan pesan rental PlayStation terdekat dengan jaminan ketersediaan real-time. 
            500+ mitra terverifikasi siap memberikan pengalaman gaming terbaik.
          </p>
          
          <!-- Search Bar -->
          <div class="bg-white p-2 rounded-xl shadow-xl shadow-black/20 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div class="flex-grow flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400/20 transition-all">
              <Icon name="heroicons:magnifying-glass-20-solid" class="text-slate-400 w-5 h-5 mr-3" />
              <input 
                v-model="searchTerm"
                type="text" 
                placeholder="Cari nama rental atau lokasi..." 
                class="bg-transparent focus:ring-0 w-full text-slate-900 placeholder-slate-400 font-medium text-base outline-none"
                @keyup.enter="$router.push({ path: '/mitra', query: { q: searchTerm } })"
              >
            </div>
            <button 
              @click="$router.push({ path: '/mitra', query: { q: searchTerm } })"
              class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center space-x-2 min-w-[120px]"
            >
              <span>Cari</span>
              <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Social Proof -->
          <div class="flex flex-wrap items-center gap-6 mt-8">
            <div class="flex items-center space-x-3">
              <div class="flex -space-x-2">
                <NuxtImg v-for="i in 4" :key="i" 
                  :src="`https://i.pravatar.cc/40?img=${i + 10}`" 
                  class="w-8 h-8 rounded-full border-2 border-navy"
                  alt="User"
                  width="32"
                  height="32"
                />
              </div>
              <div>
                <div class="flex items-center space-x-1">
                  <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="w-3.5 h-3.5 text-yellow-400" />
                  <span class="text-white text-sm font-bold ml-1">4.9</span>
                </div>
                <span class="text-slate-400 text-xs font-medium">10,000+ gamers</span>
              </div>
            </div>
            <div class="h-8 w-px bg-white/10 hidden sm:block" />
            <div class="flex items-center space-x-2 text-slate-400">
              <Icon name="heroicons:shield-check-20-solid" class="w-5 h-5 text-primary-400" />
              <span class="text-sm font-medium">Pembayaran Aman & Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="relative z-10 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 lg:p-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center lg:text-left">
            <p class="text-2xl lg:text-3xl font-black text-navy mb-1">{{ stat.value }}</p>
            <p class="text-sm font-bold text-slate-900">{{ stat.label }}</p>
            <p class="text-xs text-slate-500 font-medium mt-0.5">{{ stat.sub }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Mengapa Memilih Kami</span>
        <h2 class="text-3xl lg:text-4xl font-black text-navy mt-3 leading-tight">Solusi Booking Rental PS Modern</h2>
        <p class="text-slate-500 mt-4 font-medium leading-relaxed">Kami menghadirkan pengalaman booking yang seamless dengan teknologi real-time dan jaringan mitra terkurasi.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="feature in features" 
          :key="feature.title"
          class="group bg-slate-50 hover:bg-white p-6 lg:p-8 rounded-xl border border-slate-100 hover:border-primary-200 transition-all duration-300 hover:shadow-lg"
        >
          <div class="w-12 h-12 bg-primary-50 group-hover:bg-primary-600 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
            <Icon :name="feature.icon" class="w-6 h-6 text-primary-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <h3 class="text-lg font-bold text-navy mb-2">{{ feature.title }}</h3>
          <p class="text-slate-500 text-sm font-medium leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="bg-slate-50 border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div class="text-center max-w-2xl mx-auto mb-14">
          <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Proses Sederhana</span>
          <h2 class="text-3xl lg:text-4xl font-black text-navy mt-3 leading-tight">Booking dalam 3 Langkah</h2>
          <p class="text-slate-500 mt-4 font-medium leading-relaxed">Tidak perlu ribet. Temukan, pilih, dan mainkan dalam hitungan menit.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connecting line (desktop only) -->
          <div class="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-slate-200" />
          
          <div v-for="(step, idx) in steps" :key="step.number" class="relative text-center">
            <div class="relative z-10 w-16 h-16 bg-white border-2 border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span class="text-xl font-black text-primary-600">{{ step.number }}</span>
            </div>
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon :name="step.icon" class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">{{ step.title }}</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section id="mitra-list" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
      <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-5">
        <div>
          <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Jaringan Terpercaya</span>
          <h2 class="text-3xl lg:text-4xl font-black text-navy mt-3 leading-tight">Mitra Rental Pilihan</h2>
          <p class="text-slate-500 mt-3 font-medium max-w-xl">Daftar mitra terkurasi dengan fasilitas premium dan unit terlengkap di kota Anda.</p>
        </div>
        <NuxtLink to="/mitra" class="group inline-flex items-center space-x-2 bg-navy hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all text-sm">
          <span>Lihat Semua Mitra</span>
          <Icon name="heroicons:arrow-long-right-20-solid" class="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl overflow-hidden animate-pulse border border-slate-100">
          <div class="h-48 bg-slate-100"></div>
          <div class="p-5 space-y-3">
            <div class="h-5 bg-slate-100 rounded-lg w-3/4"></div>
            <div class="h-4 bg-slate-100 rounded-lg w-1/2"></div>
            <div class="pt-3 border-t border-slate-50 flex justify-between items-center">
              <div class="h-6 bg-slate-100 rounded-lg w-24"></div>
              <div class="w-10 h-10 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-16 text-center bg-red-50 rounded-xl border border-red-100">
        <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:exclamation-triangle-20-solid" class="w-7 h-7 text-red-500" />
        </div>
        <h3 class="text-lg font-black text-red-900">Gagal Memuat Data</h3>
        <p class="text-red-600/70 mt-1 font-medium text-sm">Silakan periksa koneksi internet Anda.</p>
        <button @click="refresh()" class="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-[1.02]">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMitras.length === 0" class="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div class="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:magnifying-glass-20-solid" class="w-8 h-8 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-slate-700">Tidak Ditemukan</h3>
        <p class="text-slate-500 mt-1 font-medium text-sm">Coba kata kunci pencarian lain atau jelajahi semua mitra.</p>
        <NuxtLink to="/mitra" class="mt-4 inline-flex items-center space-x-1.5 text-primary-600 font-bold hover:text-primary-700 transition-colors text-sm">
          <span>Lihat Semua Mitra</span>
          <Icon name="heroicons:arrow-long-right-20-solid" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Partner Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="mitra in filteredMitras" 
          :key="mitra.id" 
          class="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          <!-- Image -->
          <div class="relative h-48 overflow-hidden">
            <NuxtImg 
              :src="mitra.identityPhoto" 
              :alt="mitra.shopName"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              width="400"
              height="300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
            
            <!-- Status Badge -->
            <div class="absolute top-3 left-3">
              <span :class="['px-2.5 py-1 rounded-md text-[10px] font-bold', mitra.isOpen ? 'bg-green-500 text-white' : 'bg-slate-500 text-white']">
                {{ mitra.isOpen ? 'BUKA' : 'TUTUP' }}
              </span>
            </div>
            
            <!-- Rating -->
            <div class="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg flex items-center shadow-sm">
              <Icon name="heroicons:star-solid" class="text-yellow-400 w-3.5 h-3.5 mr-1" />
              <span class="text-sm font-bold text-navy">{{ mitra.rating }}</span>
              <span v-if="mitra.reviewsCount" class="text-[10px] text-slate-400 ml-0.5">({{ mitra.reviewsCount }})</span>
            </div>
            
            <!-- Distance -->
            <div v-if="mitra.distance" class="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg flex items-center shadow-sm">
              <Icon name="heroicons:map-pin-20-solid" class="text-primary-500 w-3.5 h-3.5 mr-1" />
              <span class="text-xs font-bold text-navy">{{ mitra.distance }} km</span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="text-base font-bold text-navy mb-1 group-hover:text-primary-600 transition-colors truncate">
              {{ mitra.shopName }}
            </h3>
            <p class="text-slate-500 text-sm font-medium flex items-center mb-4 truncate">
              <Icon name="heroicons:map-pin-20-solid" class="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" />
              <span class="truncate">{{ mitra.address }}</span>
            </p>
            
            <div class="flex justify-between items-center pt-4 border-t border-slate-100">
              <div>
                <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Mulai dari</p>
                <p class="text-lg font-black text-navy">
                  Rp{{ mitra.minPrice.toLocaleString('id-ID') }}<<span class="text-sm font-medium text-slate-400">/jam</span>
                </p>
              </div>
              <NuxtLink 
                :to="`/mitra/${mitra.id}`"
                class="bg-navy hover:bg-primary-600 text-white p-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center"
              >
                <Icon name="heroicons:arrow-long-right-20-solid" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="bg-slate-50 border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div class="text-center max-w-2xl mx-auto mb-14">
          <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Testimoni Pengguna</span>
          <h2 class="text-3xl lg:text-4xl font-black text-navy mt-3 leading-tight">Dipercaya oleh Gamer & Pemilik Rental</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="testi in testimonials" :key="testi.name" class="bg-white p-6 lg:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div class="flex items-center space-x-1 mb-4">
              <Icon v-for="i in testi.rating" :key="i" name="heroicons:star-solid" class="w-4 h-4 text-yellow-400" />
            </div>
            <p class="text-slate-700 font-medium leading-relaxed mb-6 text-sm">"{{ testi.content }}"</p>
            <div class="flex items-center space-x-3">
              <NuxtImg :src="testi.avatar" :alt="testi.name" class="w-10 h-10 rounded-full" width="40" height="40" />
              <div>
                <p class="text-sm font-bold text-navy">{{ testi.name }}</p>
                <p class="text-xs text-slate-500 font-medium">{{ testi.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Badges -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="badge in trustBadges" :key="badge.title" class="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon :name="badge.icon" class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p class="text-sm font-bold text-navy">{{ badge.title }}</p>
            <p class="text-xs text-slate-500 font-medium">{{ badge.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div class="relative bg-navy rounded-2xl p-8 md:p-14 overflow-hidden">
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div class="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div class="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
            <Icon name="heroicons:sparkles-20-solid" class="w-4 h-4 text-primary-300" />
            <span class="text-primary-200 text-xs font-bold uppercase tracking-wider">Untuk Pemilik Rental</span>
          </div>
          
          <h2 class="text-3xl md:text-4xl font-black text-white leading-tight">
            Punya Rental PS? <span class="text-primary-400">Bergabung Sekarang</span>
          </h2>
          
          <p class="text-slate-300 font-medium leading-relaxed max-w-xl mx-auto">
            Tingkatkan visibilitas bisnis Anda dengan platform booking digital yang digunakan ribuan gamer aktif di seluruh Indonesia.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <NuxtLink to="/auth/register?role=partner" class="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-95 flex items-center justify-center space-x-2">
              <span>Daftar Gratis</span>
              <Icon name="heroicons:arrow-long-right-20-solid" class="w-4 h-4" />
            </NuxtLink>
            <NuxtLink to="/mitra/join" class="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold border border-white/20 transition-all active:scale-95">
              Pelajari Selengkapnya
            </NuxtLink>
          </div>
          
          <div class="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-slate-400">
            <div class="flex items-center space-x-1.5">
              <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-400" />
              <span>Tanpa biaya pendaftaran</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-400" />
              <span>Support teknis 24/7</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-400" />
              <span>Dashboard analytics</span>
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

html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>