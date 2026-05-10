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

const handleBooking = (unitId) => {
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
    return
  }
  navigateTo(`/booking/${mitraId}?unitId=${unitId}`)
}

const stats = computed(() => [
  { label: 'Rating', value: mitra.value?.avgRating || '0.0', icon: 'heroicons:star-solid', color: 'text-yellow-400' },
  { label: 'Ulasan', value: mitra.value?.reviewsCount || '0', icon: 'heroicons:chat-bubble-bottom-center-text-20-solid', color: 'text-blue-500' },
  { label: 'Terjual', value: '500+', icon: 'heroicons:shopping-bag-20-solid', color: 'text-green-500' },
])
</script>

<template>
  <div class="min-h-screen bg-white pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Loading State -->
      <div v-if="pending" class="space-y-10 animate-pulse">
        <div class="h-8 bg-gray-100 rounded-2xl w-64"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div class="lg:col-span-2 space-y-8">
            <div class="h-[500px] bg-gray-100 rounded-[40px]"></div>
            <div class="h-48 bg-gray-100 rounded-[40px]"></div>
          </div>
          <div class="h-[600px] bg-gray-100 rounded-[40px]"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !mitra" class="text-center py-32 bg-red-50 rounded-[40px] border border-red-100">
        <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
        </div>
        <h3 class="text-3xl font-black text-navy">Mitra Tidak Ditemukan</h3>
        <p class="text-gray-500 mt-4 max-w-md mx-auto">Maaf, data mitra yang Anda cari tidak tersedia atau sudah tidak aktif.</p>
        <NuxtLink to="/" class="mt-10 bg-navy text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-primary-600 transition-all inline-block">
          Kembali ke Beranda
        </NuxtLink>
      </div>

      <!-- Main Content -->
      <template v-else>
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-3 mb-10 text-sm font-black uppercase tracking-widest text-gray-400">
          <NuxtLink to="/" class="hover:text-primary-500 transition-colors">Home</NuxtLink>
          <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          <span class="text-navy">{{ mitra.shopName }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Left Content -->
          <div class="lg:col-span-2 space-y-12">
            <!-- Gallery Section -->
            <div class="space-y-6">
              <div v-if="mitra.photos?.length > 0" class="group relative h-[550px] rounded-[48px] overflow-hidden shadow-2xl shadow-navy/10 border border-gray-100">
                <img 
                  :src="mitra.photos[activePhoto].photoUrl" 
                  class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  alt="Mitra Photo"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <p class="text-lg font-black tracking-tight">{{ mitra.photos[activePhoto].caption || 'Fasilitas Premium' }}</p>
                  <p class="text-white/60 text-sm mt-1">Rasakan kenyamanan bermain di {{ mitra.shopName }}</p>
                </div>
              </div>
              <div v-else class="h-[500px] bg-gray-50 rounded-[48px] flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                <Icon name="heroicons:photo" class="w-24 h-24 mb-4" />
                <p class="font-bold uppercase tracking-widest text-sm">Belum ada foto galeri</p>
              </div>

              <!-- Thumbnails -->
              <div v-if="mitra.photos?.length > 1" class="flex flex-wrap gap-4">
                <button 
                  v-for="(photo, index) in mitra.photos" 
                  :key="index"
                  @click="activePhoto = index"
                  class="relative w-28 h-28 rounded-3xl overflow-hidden border-4 transition-all group"
                  :class="activePhoto === index ? 'border-primary-500 scale-105 shadow-xl' : 'border-transparent opacity-50 hover:opacity-100'"
                >
                  <img :src="photo.photoUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
                </button>
              </div>
            </div>

            <!-- Profile Info -->
            <div class="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5 relative overflow-hidden group">
              <div class="absolute -top-12 -right-12 w-48 h-48 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h1 class="text-5xl font-black text-navy tracking-tight leading-tight">{{ mitra.shopName }}</h1>
                <div class="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-100 self-start">
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span class="text-xs font-black uppercase tracking-widest">Toko Buka</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-8 mb-10">
                <div v-for="stat in stats" :key="stat.label" class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                    <Icon :name="stat.icon" :class="['w-6 h-6', stat.color]" />
                  </div>
                  <div>
                    <p class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">{{ stat.label }}</p>
                    <p class="text-lg font-black text-navy mt-1">{{ stat.value }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 flex-grow">
                  <Icon name="heroicons:map-pin-20-solid" class="w-6 h-6 text-primary-500 shrink-0" />
                  <span class="text-sm font-bold text-gray-500 leading-relaxed">{{ mitra.address }}</span>
                </div>
              </div>

              <div class="prose prose-navy max-w-none">
                <h3 class="text-xl font-black text-navy mb-4">Tentang Rental Ini</h3>
                <p class="text-gray-500 font-medium leading-loose text-lg">
                  {{ mitra.description || 'Nikmati pengalaman bermain PlayStation terbaik dengan kualitas gambar 4K, kursi gaming yang nyaman, dan berbagai pilihan judul game terbaru di ' + mitra.shopName + '.' }}
                </p>
              </div>
            </div>

            <!-- Units Section -->
            <div class="space-y-8">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-1.5 bg-primary-500 rounded-full"></div>
                <h2 class="text-3xl font-black text-navy tracking-tight">Pilih Kursi Gaming</h2>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div 
                  v-for="unit in mitra.units" 
                  :key="unit.id"
                  class="group relative bg-white p-8 rounded-[40px] border border-gray-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 overflow-hidden"
                >
                  <!-- Availability Background Badge -->
                  <div 
                    class="absolute -top-10 -right-10 w-32 h-32 blur-[60px] transition-opacity"
                    :class="unit.isAvailable ? 'bg-green-500/20' : 'bg-red-500/10'"
                  ></div>

                  <div class="flex items-start justify-between mb-8 relative z-10">
                    <div class="flex items-center space-x-4">
                      <div class="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform">
                        <Icon 
                          :name="unit.type === 'PS5' ? 'heroicons:cpu-chip-20-solid' : 'heroicons:computer-desktop-20-solid'" 
                          class="w-8 h-8 text-primary-400" 
                        />
                      </div>
                      <div>
                        <h3 class="text-xl font-black text-navy leading-none">{{ unit.name }}</h3>
                        <p class="text-primary-500 font-black uppercase text-[10px] tracking-widest mt-2">{{ unit.type }} Console</p>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-end justify-between relative z-10">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tarif Sewa</p>
                      <p class="text-2xl font-black text-navy">
                        Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}<span class="text-sm font-medium text-gray-400 ml-1">/jam</span>
                      </p>
                    </div>
                    
                    <button 
                      @click="handleBooking(unit.id)"
                      :disabled="!unit.isAvailable"
                      class="relative px-8 py-3 rounded-2xl font-black text-sm transition-all group-hover:translate-x-1"
                      :class="unit.isAvailable 
                        ? 'bg-navy text-white hover:bg-primary-500 hover:text-navy shadow-lg shadow-navy/20' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                      "
                    >
                      {{ unit.isAvailable ? 'Booking Sekarang' : 'Sedang Dipakai' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews Section -->
            <div id="reviews" class="space-y-10">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-1.5 h-8 bg-primary-500 rounded-full"></div>
                  <h2 class="text-3xl font-black text-navy tracking-tight">Ulasan Pelanggan</h2>
                </div>
                <div class="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                  <Icon name="heroicons:star-solid" class="text-yellow-400 w-5 h-5" />
                  <span class="text-lg font-black text-navy">{{ mitra.avgRating || '0.0' }}</span>
                  <span class="text-sm text-gray-400 font-bold">/ 5.0</span>
                </div>
              </div>

              <div v-if="mitra.reviews?.length > 0" class="grid grid-cols-1 gap-6">
                <div 
                  v-for="review in mitra.reviews" 
                  :key="review.id"
                  class="bg-white p-8 rounded-[40px] border border-gray-100 hover:border-primary-100 transition-all group"
                >
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-white font-black text-lg">
                        {{ review.user?.name?.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-black text-navy tracking-tight">{{ review.user?.name }}</p>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                          {{ new Date(review.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Icon 
                        v-for="i in 5" 
                        :key="i" 
                        name="heroicons:star-solid" 
                        :class="['w-5 h-5', i <= review.rating ? 'text-yellow-400' : 'text-gray-100']" 
                      />
                    </div>
                  </div>
                  <p class="text-gray-500 font-medium leading-relaxed italic">"{{ review.comment || 'Tidak ada komentar.' }}"</p>
                </div>
              </div>

              <div v-else class="bg-gray-50 rounded-[48px] p-20 text-center border-2 border-dashed border-gray-100">
                <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Icon name="heroicons:chat-bubble-bottom-center" class="w-10 h-10 text-gray-200" />
                </div>
                <p class="text-gray-400 font-black uppercase tracking-widest text-xs">Belum ada ulasan untuk mitra ini.</p>
              </div>
            </div>
          </div>

          <!-- Right Content: Sidebar -->
          <div class="space-y-8">
            <!-- Snacks Sticky Sidebar -->
            <div class="bg-navy rounded-[48px] p-10 text-white sticky top-28 shadow-2xl shadow-navy/30 overflow-hidden group">
              <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-700"></div>
              
              <div class="relative z-10">
                <div class="flex items-center space-x-3 mb-10">
                  <div class="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <Icon name="heroicons:shopping-cart-20-solid" class="text-primary-500 w-6 h-6" />
                  </div>
                  <h2 class="text-2xl font-black tracking-tight">Snacks Corner</h2>
                </div>

                <div v-if="mitra.snacks?.length > 0" class="space-y-6">
                  <div v-for="snack in mitra.snacks" :key="snack.id" class="flex justify-between items-center group/item p-4 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                    <div class="space-y-1">
                      <p class="font-bold text-lg leading-none group-hover/item:text-primary-400 transition-colors">{{ snack.name }}</p>
                      <p class="text-sm text-primary-100/50 font-bold tracking-wide">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                    </div>
                   
                  </div>
                </div>
                
                <div v-else class="text-center py-12 px-6 bg-white/5 rounded-[32px] border border-white/5">
                  <Icon name="heroicons:face-frown" class="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p class="text-white/40 font-medium text-sm leading-relaxed">Saat ini belum ada menu snack tersedia di mitra ini.</p>
                </div>

                <div class="mt-12 p-8 bg-primary-400/10 backdrop-blur-md rounded-[32px] border border-primary-400/20">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-4">Informasi Tambahan</p>
                  <p class="text-sm text-primary-100/70 font-medium leading-loose">
                    Anda bisa memesan snack langsung melalui aplikasi saat melakukan booking unit. Nikmati kenyamanan bermain tanpa rasa lapar!
                  </p>
                </div>
              </div>
            </div>

            <!-- Help Card -->
            <div class="bg-gray-50 p-10 rounded-[48px] border border-gray-100 space-y-6">
              <h4 class="text-xl font-black text-navy">Butuh Bantuan?</h4>
              <p class="text-gray-500 text-sm font-medium leading-loose">Punya pertanyaan seputar fasilitas atau ingin mengajukan komplain? Tim support kami siap membantu 24/7.</p>
              <button class="w-full bg-white border-2 border-navy text-navy px-8 py-4 rounded-2xl font-black text-sm hover:bg-navy hover:text-white transition-all active:scale-95">
                Hubungi Support
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
