<script setup>
const { isLoggedIn, user, logout } = useAuth()

const menuItems = [
  { name: 'Home', path: '/', icon: 'heroicons:home-20-solid' },
  { name: 'Sewa PS', path: '/mitra', icon: 'heroicons:device-phone-mobile-20-solid' },
  { name: 'Promo Seru', path: '/promos', icon: 'heroicons:ticket-20-solid' },
]

const scrolled = ref(false)

if (process.client) {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 50
  })
}
</script>

<template>
  <!-- Wrapper agar konten bawah tidak melonjak -->
  <div class="relative z-[60] h-20">
    <nav 
      :class="[
        'fixed left-0 right-0 z-50 transition-all duration-700 ease-in-out px-4',
        scrolled 
          ? 'top-4' 
          : 'top-0'
      ]"
    >
      <div 
        :class="[
          'mx-auto transition-all duration-700 ease-in-out border-b border-transparent',
          scrolled 
            ? 'max-w-5xl bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] border-white/40 py-2 px-2' 
            : 'max-w-full bg-white py-4 px-6 sm:px-10'
        ]"
      >
        <div class="flex justify-between items-center h-14">
          
          <!-- LEFT: Logo -->
          <div class="flex items-center flex-shrink-0">
            <NuxtLink to="/" class="group flex items-center space-x-3">
              <div :class="[
                'bg-navy flex items-center justify-center transition-all duration-500 shadow-lg shadow-navy/20',
                scrolled ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl group-hover:rotate-12 group-hover:scale-110'
              ]">
                <Icon name="heroicons:bolt-20-solid" class="text-primary-400 w-6 h-6" />
              </div>
              <span class="text-xl font-black tracking-tighter text-navy uppercase flex items-center">
                Rent<span class="text-primary-500">PS</span>
              </span>
            </NuxtLink>
          </div>

          <!-- CENTER: Desktop Menu (Traveloka Style) -->
          <div class="hidden md:flex items-center bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50">
            <NuxtLink 
              v-for="item in menuItems" 
              :key="item.path" 
              :to="item.path"
              class="relative px-6 py-2 rounded-full text-gray-500 font-bold transition-all text-sm flex items-center space-x-2 hover:text-navy group"
              active-class="!text-navy bg-white shadow-sm"
            >
              <Icon :name="item.icon" class="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </div>

          <!-- RIGHT: Auth & Profile -->
          <div class="flex items-center space-x-2">
            <template v-if="!isLoggedIn">
              <NuxtLink to="/auth/login" class="hidden sm:block text-navy font-bold text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
                Log In
              </NuxtLink>
              <NuxtLink to="/auth/register" class="bg-navy text-white px-7 py-2.5 rounded-full font-bold text-sm transition-all hover:bg-primary-500 hover:text-navy hover:shadow-xl hover:shadow-primary-500/20 active:scale-95">
                Join Now
              </NuxtLink>
            </template>

            <template v-else>
              <div class="flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
                <!-- Badges (Hidden on mobile scroll) -->
                <div v-if="!scrolled" class=" lg:flex items-center space-x-1 mr-3 pl-2">
                  <NuxtLink v-if="user?.role === 'ADMIN'" to="/admin/dashboard" class="text-[9px] font-black tracking-widest uppercase bg-primary-500 text-navy px-3 py-1.5 rounded-full">
                    DASHBOARD
                  </NuxtLink>
                  <NuxtLink v-if="user?.role === 'CUSTOMER'" to="/user/bookings" class="text-[9px] font-black tracking-widest uppercase bg-primary-500 text-navy px-3 py-1.5 rounded-full">
                    MY ORDER
                  </NuxtLink>
                  <NuxtLink v-if="user?.role === 'MITRA'" to="/mitra/dashboard" class="text-[9px] font-black tracking-widest uppercase bg-navy text-white px-3 py-1.5 rounded-full">
                    DASHBOARD
                  </NuxtLink>
                </div>

                <!-- Avatar User -->
                <NuxtLink 
                  :to="user?.role === 'CUSTOMER' ? '/user/profile' : '#'"
                  class="group flex items-center space-x-2 pr-2"
                >
                  <div class="w-9 h-9 rounded-xl bg-white border border-gray-200 overflow-hidden group-hover:border-primary-500 transition-colors shadow-sm">
                    <img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="user.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gray-50">
                      <Icon name="heroicons:user-20-solid" class="text-navy w-5 h-5" />
                    </div>
                  </div>
                  <div class="hidden sm:block text-left leading-tight">
                    <p class="text-xs font-black text-navy">{{ user?.name?.split(' ')[0] }}</p>
                    <p class="text-[8px] text-gray-400 uppercase font-bold tracking-tighter">{{ user?.role }}</p>
                  </div>
                </NuxtLink>

                <!-- Logout -->
                <button 
                  @click="logout" 
                  class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                >
                  <Icon name="heroicons:arrow-right-on-rectangle-20-solid" class="w-5 h-5" />
                </button>
              </div>
            </template>
          </div>

        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Transisi halus untuk semua elemen didalam nav */
nav * {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efek active menu yang smooth */
.router-link-active {
  transform: translateY(-1px);
}
</style>
