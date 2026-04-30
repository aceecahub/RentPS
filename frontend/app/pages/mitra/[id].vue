<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const mitraId = route.params.id

// Fetch real data from backend
const { data: response, pending, error } = await useFetch(`${config.public.apiBase}/mitra/${mitraId}`)

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
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Loading State -->
    <div v-if="pending" class="space-y-10 animate-pulse">
      <div class="h-6 w-48 bg-gray-200 rounded"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-8">
          <div class="h-[400px] bg-gray-200 rounded-3xl"></div>
          <div class="h-40 bg-gray-200 rounded-3xl"></div>
        </div>
        <div class="h-[500px] bg-gray-200 rounded-3xl"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !mitra" class="text-center py-20">
      <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-300 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-navy">Mitra Tidak Ditemukan</h3>
      <p class="text-gray-500 mt-2">Maaf, data mitra yang Anda cari tidak tersedia atau sedang dalam perbaikan.</p>
      <NuxtLink to="/" class="mt-6 btn-primary inline-block">Kembali ke Beranda</NuxtLink>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Breadcrumb -->
      <nav class="flex mb-6 text-sm font-medium text-gray-500">
        <NuxtLink to="/" class="hover:text-navy">Home</NuxtLink>
        <Icon name="heroicons:chevron-right" class="mx-2 w-4 h-4" />
        <span class="text-navy">{{ mitra.shopName }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Left: Photos & Info -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Gallery -->
          <div class="space-y-4">
            <div v-if="mitra.photos?.length > 0" class="relative h-[400px] rounded-3xl overflow-hidden shadow-lg">
              <img 
                :src="mitra.photos[activePhoto].photoUrl" 
                class="w-full h-full object-cover transition-opacity duration-500"
                alt="Mitra Photo"
              >
              <div class="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm">
                {{ mitra.photos[activePhoto].caption || 'Foto Mitra' }}
              </div>
            </div>
            <div v-else class="h-[400px] bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400">
              <Icon name="heroicons:photo" class="w-16 h-16" />
            </div>

            <div v-if="mitra.photos?.length > 1" class="flex space-x-4">
              <button 
                v-for="(photo, index) in mitra.photos" 
                :key="index"
                @click="activePhoto = index"
                class="relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all"
                :class="activePhoto === index ? 'border-navy scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'"
              >
                <img :src="photo.photoUrl" class="w-full h-full object-cover">
              </button>
            </div>
          </div>

          <!-- Shop Info -->
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h1 class="text-4xl font-bold text-navy mb-2">{{ mitra.shopName }}</h1>
            <div class="flex items-center space-x-4 mb-6">
              <div class="flex items-center text-yellow-500">
                <Icon name="heroicons:star-solid" class="w-5 h-5" />
                <span class="ml-1 font-bold text-lg">4.8</span>
              </div>
              <span class="text-gray-300">|</span>
              <span class="text-gray-500 underline">124 ulasan</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-500 flex items-center">
                <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
                {{ mitra.address }}
              </span>
            </div>
            <p class="text-gray-600 leading-relaxed text-lg">
              {{ mitra.description || 'Rental PlayStation berkualitas dengan fasilitas lengkap untuk kenyamanan bermain Anda.' }}
            </p>
          </div>

          <!-- PlayStation Units (Kursi) -->
          <div>
            <h2 class="text-2xl font-bold text-navy mb-6">Pilih Kursi PlayStation</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                v-for="unit in mitra.units" 
                :key="unit.id"
                class="p-6 border rounded-2xl flex justify-between items-center transition-all"
                :class="unit.isAvailable ? 'bg-white border-gray-100 hover:border-navy' : 'bg-gray-50 border-gray-100 opacity-70'"
              >
                <div>
                  <div class="flex items-center space-x-2 mb-1">
                    <Icon 
                      :name="unit.type === 'PS5' ? 'heroicons:cpu-chip' : 'heroicons:computer-desktop'" 
                      class="w-5 h-5 text-primary-500" 
                    />
                    <h3 class="font-bold text-navy">{{ unit.name }}</h3>
                  </div>
                  <p class="text-lg font-black text-navy">Rp{{ parseFloat(unit.pricePerHour).toLocaleString() }}<span class="text-sm font-normal text-gray-500">/jam</span></p>
                  <span 
                    class="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-2 inline-block"
                    :class="unit.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ unit.isAvailable ? 'Tersedia' : 'Sedang Dipakai' }}
                  </span>
                </div>
                <button 
                  @click="handleBooking(unit.id)"
                  :disabled="!unit.isAvailable"
                  class="btn-primary py-3 px-6 shadow-lg shadow-navy/20 disabled:bg-gray-300 disabled:shadow-none transition-transform active:scale-95"
                >
                  Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Snacks & Summary -->
        <div class="space-y-8">
          <!-- Snacks -->
          <div class="bg-navy rounded-3xl p-8 text-white sticky top-28 shadow-xl">
            <h2 class="text-xl font-bold mb-6 flex items-center">
              <Icon name="heroicons:shopping-cart" class="mr-2 w-6 h-6" />
              Snack & Minuman
            </h2>
            <div v-if="mitra.snacks?.length > 0" class="space-y-6">
              <div v-for="snack in mitra.snacks" :key="snack.id" class="flex justify-between items-center group">
                <div>
                  <p class="font-medium group-hover:text-primary-300 transition-colors">{{ snack.name }}</p>
                  <p class="text-sm text-gray-400">Rp{{ parseFloat(snack.price).toLocaleString() }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Icon name="heroicons:plus" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-400 text-sm">
              Tidak ada snack tersedia.
            </div>
            
            <div class="mt-10 pt-6 border-t border-white/10">
              <div class="flex justify-between items-center mb-4 text-sm text-gray-300">
                <span>Status Jam Kosong</span>
                <span class="text-green-400 font-bold">Tersedia</span>
              </div>
              <p class="text-xs text-gray-400 italic">
                *Silakan pilih unit di sebelah kiri untuk melanjutkan ke pembayaran.
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
