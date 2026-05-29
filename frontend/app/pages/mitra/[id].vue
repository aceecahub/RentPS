<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const mitraId = route.params.id

// Fetch real data from backend
const { data: response, pending, error } = await useFetch(`${config.public.apiBase}/mitra/${mitraId}`, {
  key: `mitra-detail-${mitraId}`,
  headers: useRequestHeaders(['cookie'])
})

const mitra = computed(() => response.value?.data || null)
const activePhoto = ref(0)
const { isLoggedIn } = useAuth()

// Scroll detection untuk navbar
const { y: scrollY } = useWindowScroll()
const isScrolled = computed(() => scrollY.value > 20)

const handleBooking = (unitId) => {
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
    return
  }
  navigateTo(`/booking/${mitraId}?unitId=${unitId}`)
}

const handleChat = () => {
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
    return
  }
  navigateTo(`/chat/${mitraId}`)
}

const stats = computed(() => [
  { label: 'Rating', value: mitra.value?.avgRating || '0.0', icon: 'heroicons:star-solid', color: 'text-yellow-400' },
  { label: 'Ulasan', value: mitra.value?.reviewsCount || '0', icon: 'heroicons:chat-bubble-bottom-center-text-20-solid', color: 'text-primary-500' },
  { label: 'Terjual', value: '500+', icon: 'heroicons:shopping-bag-20-solid', color: 'text-green-500' },
])

const trustBadges = [
  { icon: 'heroicons:shield-check-20-solid', title: 'Mitra Terverifikasi' },
  { icon: 'heroicons:clock-20-solid', title: 'Update Real-time' },
  { icon: 'heroicons:banknotes-20-solid', title: 'Harga Transparan' }
]
</script>

<template>
  <div class="min-h-screen bg-white antialiased">
    <!-- Loading State -->
    <div v-if="pending" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div class="space-y-8 animate-pulse">
        <div class="h-6 bg-slate-100 rounded-xl w-48"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="h-[400px] bg-slate-100 rounded-2xl"></div>
            <div class="h-40 bg-slate-100 rounded-2xl"></div>
          </div>
          <div class="h-[500px] bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !mitra" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div class="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
        <div class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:exclamation-triangle-20-solid" class="w-8 h-8 text-red-500" />
        </div>
        <h3 class="text-2xl font-black text-red-900">Mitra Tidak Ditemukan</h3>
        <p class="text-red-600/70 mt-2 text-sm font-medium max-w-md mx-auto">Maaf, data mitra yang Anda cari tidak tersedia atau sudah tidak aktif.</p>
        <NuxtLink to="/" class="mt-8 bg-navy hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-bold transition-all inline-flex items-center space-x-2">
          <Icon name="heroicons:arrow-left-20-solid" class="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 mb-8 text-sm font-medium text-slate-400">
          <NuxtLink to="/" class="hover:text-primary-600 transition-colors">Home</NuxtLink>
          <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4" />
          <NuxtLink to="/mitra" class="hover:text-primary-600 transition-colors">Mitra</NuxtLink>
          <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4" />
          <span class="text-navy font-semibold truncate max-w-[200px]">{{ mitra.shopName }}</span>
        </nav>

        <!-- Header Info Mobile -->
        <div class="lg:hidden mb-6">
          <div class="flex items-center gap-2 mb-3">
            <span class="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-md border border-green-100">
              Buka
            </span>
            <div class="flex items-center space-x-1">
              <Icon name="heroicons:star-solid" class="w-4 h-4 text-yellow-400" />
              <span class="text-sm font-bold text-navy">{{ mitra.avgRating || '0.0' }}</span>
              <span class="text-xs text-slate-400">({{ mitra.reviewsCount || 0 }})</span>
            </div>
          </div>
          <h1 class="text-3xl font-black text-navy leading-tight">{{ mitra.shopName }}</h1>
          <p class="text-slate-500 text-sm font-medium mt-2 flex items-start">
            <Icon name="heroicons:map-pin-20-solid" class="w-4 h-4 mr-1.5 text-primary-500 flex-shrink-0 mt-0.5" />
            {{ mitra.address }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Content -->
          <div class="lg:col-span-2 space-y-10">
            
            <!-- Gallery Section -->
            <div class="space-y-4">
              <div v-if="mitra.photos?.length > 0" class="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img 
                  :src="mitra.photos[activePhoto].photoUrl" 
                  class="w-full h-full object-cover"
                  alt="Mitra Photo"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
                
                <!-- Photo Counter -->
                <div class="absolute bottom-4 right-4 bg-navy/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  {{ activePhoto + 1 }} / {{ mitra.photos.length }}
                </div>
              </div>
              
              <div v-else class="h-[400px] bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
                <Icon name="heroicons:photo-20-solid" class="w-16 h-16 mb-3" />
                <p class="font-bold text-sm text-slate-400">Belum ada foto galeri</p>
              </div>

              <!-- Thumbnails -->
              <div v-if="mitra.photos?.length > 1" class="flex gap-3 overflow-x-auto pb-2">
                <button 
                  v-for="(photo, index) in mitra.photos" 
                  :key="index"
                  @click="activePhoto = index"
                  class="relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0"
                  :class="activePhoto === index ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 hover:border-slate-300'"
                >
                  <img :src="photo.photoUrl" class="w-full h-full object-cover" :alt="photo.caption || 'Gallery'">
                </button>
              </div>
            </div>

            <!-- Profile Info -->
            <div class="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div class="hidden lg:flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 class="text-3xl lg:text-4xl font-black text-navy leading-tight">{{ mitra.shopName }}</h1>
                  <p class="text-slate-500 text-sm font-medium mt-2 flex items-start">
                    <Icon name="heroicons:map-pin-20-solid" class="w-4 h-4 mr-1.5 text-primary-500 flex-shrink-0 mt-0.5" />
                    {{ mitra.address }}
                  </p>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <span class="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-green-100 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Buka
                  </span>
                  <div class="flex items-center space-x-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Icon name="heroicons:star-solid" class="w-4 h-4 text-yellow-400" />
                    <span class="text-sm font-bold text-navy">{{ mitra.avgRating || '0.0' }}</span>
                  </div>
                </div>
              </div>

              <!-- Stats Row -->
              <div class="grid grid-cols-3 gap-4 mb-8">
                <div v-for="stat in stats" :key="stat.label" class="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Icon :name="stat.icon" :class="['w-5 h-5', stat.color]" />
                  <div>
                    <p class="text-lg font-black text-navy leading-none">{{ stat.value }}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{{ stat.label }}</p>
                  </div>
                </div>
              </div>

              <!-- Trust Badges -->
              <div class="flex flex-wrap gap-3 mb-8">
                <div v-for="badge in trustBadges" :key="badge.title" class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold border border-primary-100">
                  <Icon :name="badge.icon" class="w-3.5 h-3.5" />
                  <span>{{ badge.title }}</span>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold text-navy mb-3">Tentang Rental Ini</h3>
                <p class="text-slate-500 font-medium leading-relaxed text-sm">
                  {{ mitra.description || `Nikmati pengalaman bermain PlayStation terbaik dengan kualitas gambar 4K, kursi gaming yang nyaman, dan berbagai pilihan judul game terbaru di ${mitra.shopName}.` }}
                </p>
              </div>
            </div>

            <!-- Units Section -->
            <div>
              <div class="flex items-center space-x-3 mb-6">
                <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Pilihan Unit</span>
                <div class="flex-grow h-px bg-slate-100"></div>
              </div>
              <h2 class="text-2xl lg:text-3xl font-black text-navy mb-6">Pilih Kursi Gaming</h2>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  v-for="unit in mitra.units" 
                  :key="unit.id"
                  class="group bg-white p-6 rounded-xl border border-slate-200 hover:border-primary-200 transition-all duration-300 hover:shadow-md"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center">
                        <Icon 
                          :name="unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" 
                          class="w-6 h-6 text-primary-400" 
                        />
                      </div>
                      <div>
                        <h3 class="text-base font-bold text-navy">{{ unit.name }}</h3>
                        <p class="text-primary-600 text-xs font-bold uppercase tracking-wider mt-0.5">{{ unit.type }}</p>
                      </div>
                    </div>
                    <span 
                      :class="['px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider', unit.isAvailable ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100']"
                    >
                      {{ unit.isAvailable ? 'Tersedia' : 'Dipakai' }}
                    </span>
                  </div>

                  <div class="flex items-end justify-between pt-4 border-t border-slate-50">
                    <div>
                      <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Tarif / jam</p>
                      <p class="text-xl font-black text-navy">
                        Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}
                      </p>
                    </div>
                    
                    <button 
                      @click="handleBooking(unit.id)"
                      :disabled="!unit.isAvailable"
                      class="px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95"
                      :class="unit.isAvailable 
                        ? 'bg-navy text-white hover:bg-primary-600' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      "
                    >
                      {{ unit.isAvailable ? 'Booking' : 'Penuh' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews Section -->
            <div id="reviews">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <span class="text-primary-600 font-bold uppercase tracking-wider text-xs">Testimoni</span>
                  <h2 class="text-2xl lg:text-3xl font-black text-navy mt-1">Ulasan Pelanggan</h2>
                </div>
                <div class="flex items-center space-x-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <Icon name="heroicons:star-solid" class="text-yellow-400 w-5 h-5" />
                  <span class="text-lg font-black text-navy">{{ mitra.avgRating || '0.0' }}</span>
                  <span class="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
              </div>

              <div v-if="mitra.reviews?.length > 0" class="space-y-4">
                <div 
                  v-for="review in mitra.reviews" 
                  :key="review.id"
                  class="bg-white p-6 rounded-xl border border-slate-200"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div v-if="review.user?.avatar" class="w-10 h-10 rounded-full overflow-hidden">
                        <img :src="review.user.avatar" :alt="review.user.name" class="w-full h-full object-cover">
                      </div>
                      <div v-else class="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {{ review.user?.name?.charAt(0) || 'U' }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-navy">{{ review.user?.name || 'Pengguna' }}</p>
                        <p class="text-xs text-slate-400 font-medium">
                          {{ new Date(review.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-0.5">
                      <Icon 
                        v-for="i in 5" 
                        :key="i" 
                        name="heroicons:star-solid" 
                        :class="['w-4 h-4', i <= review.rating ? 'text-yellow-400' : 'text-slate-100']" 
                      />
                    </div>
                  </div>
                  <p class="text-slate-600 text-sm font-medium leading-relaxed">{{ review.comment || 'Tidak ada komentar.' }}</p>
                </div>
              </div>

              <div v-else class="bg-slate-50 rounded-xl p-12 text-center border border-slate-100">
                <Icon name="heroicons:chat-bubble-bottom-center-text-20-solid" class="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p class="text-slate-400 font-medium text-sm">Belum ada ulasan untuk mitra ini.</p>
              </div>
            </div>
          </div>

          <!-- Right Content: Sidebar -->
          <div class="space-y-6">
            <!-- Snacks Sidebar -->
            <div class="bg-navy rounded-2xl p-6 text-white sticky top-24 shadow-lg">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:shopping-cart-20-solid" class="text-primary-400 w-5 h-5" />
                </div>
                <h2 class="text-lg font-black">Snacks Corner</h2>
              </div>

              <div v-if="mitra.snacks?.length > 0" class="space-y-3">
                <div v-for="snack in mitra.snacks" :key="snack.id" class="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5">
                  <div>
                    <p class="text-sm font-bold">{{ snack.name }}</p>
                    <p class="text-xs text-primary-200/60 font-medium">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 px-4 bg-white/5 rounded-xl border border-white/5">
                <Icon name="heroicons:face-frown-20-solid" class="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p class="text-white/40 text-xs font-medium">Belum ada menu snack tersedia.</p>
              </div>

              <div class="mt-6 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
                <p class="text-[10px] font-bold uppercase tracking-wider text-primary-400 mb-1">Info</p>
                <p class="text-xs text-primary-100/70 font-medium leading-relaxed">
                  Pesan snack saat booking unit langsung melalui aplikasi.
                </p>
              </div>
            </div>

            <!-- Chat Card -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:chat-bubble-left-right-20-solid" class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 class="text-base font-bold text-navy">Tanya Langsung</h4>
                  <p class="text-xs text-slate-400 font-medium">Respon dalam hitungan menit</p>
                </div>
              </div>
              <p class="text-slate-500 text-sm font-medium leading-relaxed mb-4">
                Punya pertanyaan soal ketersediaan unit atau fasilitas? Chat langsung dengan mitra.
              </p>
              <button
                @click="handleChat"
                class="w-full bg-navy hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Icon name="heroicons:chat-bubble-oval-left-ellipsis-20-solid" class="w-4 h-4" />
                Chat Sekarang
              </button>
            </div>

            <!-- Safety Card -->
            <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 class="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                <Icon name="heroicons:shield-check-20-solid" class="w-4 h-4 text-primary-500" />
                Jaminan Keamanan
              </h4>
              <ul class="space-y-2.5">
                <li class="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Pembayaran terenkripsi & aman</span>
                </li>
                <li class="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Refund otomatis jika unit tidak tersedia</span>
                </li>
                <li class="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <Icon name="heroicons:check-circle-20-solid" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Mitra terverifikasi oleh tim kami</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
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