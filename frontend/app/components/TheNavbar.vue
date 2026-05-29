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
  <div class="relative z-[60] h-16">
    <nav 
      :class="[
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300 ease-in-out px-4 sm:px-6 lg:px-8 bg-white border-b',
        scrolled 
          ? 'py-2 shadow-sm border-slate-200' 
          : 'py-3.5 border-slate-100'
      ]"
    >
      <div class="max-w-7xl mx-auto flex justify-between items-center h-12 w-full">
          
          <!-- LEFT: Logo -->
          <div class="flex items-center flex-shrink-0">
            <NuxtLink to="/" class="group flex items-center space-x-3">
              <div :class="[
                'bg-navy flex items-center justify-center transition-all duration-300 shadow-sm',
                scrolled ? 'w-9 h-9 rounded-lg' : 'w-10 h-10 rounded-lg'
              ]">
                <Icon name="heroicons:bolt-20-solid" class="text-primary-400 w-5 h-5" />
              </div>
              <span class="text-xl font-black tracking-tighter text-navy uppercase flex items-center">
                Rent<span class="text-primary-500">PS</span>
              </span>
            </NuxtLink>
          </div>

          <!-- CENTER: Desktop Menu -->
          <div class="hidden md:flex items-center bg-slate-100/50 p-1 rounded-lg border border-slate-200/50">
            <NuxtLink 
              v-for="item in menuItems" 
              :key="item.path" 
              :to="item.path"
              class="relative px-5 py-1.5 rounded-md text-slate-500 font-bold transition-all text-sm flex items-center space-x-2 hover:text-navy group"
              active-class="!text-navy bg-white shadow-sm"
            >
              <Icon :name="item.icon" class="w-4 h-4 opacity-70 group-hover:scale-105 transition-transform" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </div>

          <!-- RIGHT: Auth & Profile -->
          <div class="flex items-center space-x-2">
            <template v-if="!isLoggedIn">
              <NuxtLink to="/auth/login" class="hidden sm:block text-navy font-bold text-sm px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                Log In
              </NuxtLink>
              <NuxtLink to="/auth/register" class="bg-navy text-white px-5 py-2 rounded-lg font-bold text-sm transition-all hover:bg-primary-600 active:scale-95 shadow-sm">
                Join Now
              </NuxtLink>
            </template>

            <template v-else>
              <div class="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
                <!-- Badges (Hidden on mobile scroll) -->
                <div v-if="!scrolled" class=" lg:flex items-center space-x-1.5 mr-3 pl-2">
                  <NuxtLink v-if="user?.role === 'ADMIN'" to="/admin/dashboard" class="text-[10px] font-bold bg-primary-500 text-navy px-2.5 py-1 rounded">
                    DASHBOARD
                  </NuxtLink>
                  <NuxtLink v-if="user?.role === 'CUSTOMER'" to="/user/bookings" class="text-[10px] font-bold bg-primary-500 text-navy px-2.5 py-1 rounded">
                    MY ORDER
                  </NuxtLink>
                  <NuxtLink v-if="user?.role === 'CUSTOMER'" to="/user/inbox" class="text-[10px] font-bold bg-navy text-white px-2.5 py-1 rounded flex items-center gap-1">
                    <Icon name="heroicons:chat-bubble-oval-left-ellipsis-20-solid" class="w-3.5 h-3.5" />
                    INBOX
                  </NuxtLink>
                  <NuxtLink v-if="user?.role === 'MITRA'" to="/mitra/dashboard" class="text-[10px] font-bold bg-navy text-white px-2.5 py-1 rounded">
                    DASHBOARD
                  </NuxtLink>
                  <NuxtLink v-if="user?.role === 'MITRA'" to="/mitra/dashboard/inbox" class="text-[10px] font-bold bg-primary-500 text-navy px-2.5 py-1 rounded flex items-center gap-1">
                    <Icon name="heroicons:chat-bubble-oval-left-ellipsis-20-solid" class="w-3.5 h-3.5" />
                    INBOX
                  </NuxtLink>
                </div>

                <!-- Avatar User -->
                <NuxtLink 
                  :to="user?.role === 'CUSTOMER' ? '/user/profile' : '#'"
                  class="group flex items-center space-x-2 pr-2"
                >
                  <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden group-hover:border-primary-500 transition-colors shadow-sm">
                    <img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="user.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-slate-50">
                      <Icon name="heroicons:user-20-solid" class="text-navy w-4 h-4" />
                    </div>
                  </div>
                  <div class="hidden sm:block text-left leading-tight">
                    <p class="text-xs font-bold text-navy">{{ user?.name?.split(' ')[0] }}</p>
                    <p class="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">{{ user?.role }}</p>
                  </div>
                </NuxtLink>

                <!-- Logout -->
                <button 
                  @click="logout" 
                  class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                >
                  <Icon name="heroicons:arrow-right-on-rectangle-20-solid" class="w-4 h-4" />
                </button>
              </div>
            </template>
          </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Transisi halus untuk semua elemen didalam nav */
nav * {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.router-link-active {
  transform: translateY(-0.5px);
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>
