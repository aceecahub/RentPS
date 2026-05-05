<script setup>
const { isLoggedIn, user, logout } = useAuth()

const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Mitra', path: '/mitra' },
  { name: 'Promos', path: '/promos' },
]

const scrolled = ref(false)

if (process.client) {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 20
  })
}
</script>

<template>
  <nav 
    :class="[
      'sticky top-0 z-50 transition-all duration-500',
      scrolled ? 'bg-white/80 backdrop-blur-xl shadow-xl shadow-navy/5 py-2' : 'bg-white py-4'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="group flex items-center space-x-3">
            <div class="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-navy/20">
              <Icon name="heroicons:bolt-20-solid" class="text-primary-400 w-7 h-7" />
            </div>
            <span class="text-2xl font-black tracking-tighter text-navy uppercase">Rent<span class="text-primary-500">PS</span></span>
          </NuxtLink>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-1">
          <NuxtLink 
            v-for="item in menuItems" 
            :key="item.path" 
            :to="item.path"
            class="px-5 py-2 rounded-xl text-gray-500 hover:text-navy hover:bg-gray-50 font-bold transition-all text-sm tracking-wide"
            active-class="text-navy bg-primary-50"
          >
            {{ item.name }}
          </NuxtLink>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center space-x-4">
          <template v-if="!isLoggedIn">
            <NuxtLink to="/auth/login" class="text-navy font-black text-sm hover:text-primary-600 transition-colors px-4">
              Log In
            </NuxtLink>
            <NuxtLink to="/auth/register" class="bg-navy text-white px-8 py-3 rounded-2xl font-black text-sm transition-all hover:bg-primary-500 hover:text-navy shadow-lg shadow-navy/10 active:scale-95">
              Get Started
            </NuxtLink>
          </template>
          <template v-else>
            <div class="flex items-center space-x-4">
               <!-- Role Badges -->
               <div class="hidden lg:flex items-center space-x-2 mr-2">
                 <NuxtLink 
                   v-if="user?.role === 'CUSTOMER'" 
                   to="/user/bookings" 
                   class="text-[10px] font-black tracking-[0.15em] uppercase bg-primary-500 text-navy px-3 py-1.5 rounded-full shadow-sm"
                 >
                   My Bookings
                 </NuxtLink>
                 <NuxtLink 
                   v-if="user?.role === 'MITRA'" 
                   to="/mitra/dashboard" 
                   class="text-[10px] font-black tracking-[0.15em] uppercase bg-navy text-white px-3 py-1.5 rounded-full shadow-sm"
                 >
                   Mitra Dashboard
                 </NuxtLink>
                 <NuxtLink 
                   v-if="user?.role === 'ADMIN'" 
                   to="/admin/dashboard" 
                   class="text-[10px] font-black tracking-[0.15em] uppercase bg-red-600 text-white px-3 py-1.5 rounded-full shadow-sm"
                 >
                   Admin
                 </NuxtLink>
               </div>

               <div class="flex items-center space-x-3 pl-4 border-l border-gray-100">
                 <div class="text-right hidden sm:block">
                   <p class="text-xs font-black text-navy leading-none">{{ user?.name }}</p>
                   <p class="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{{ user?.role }}</p>
                 </div>
                 <NuxtLink 
                    :to="user?.role === 'CUSTOMER' ? '/user/profile' : '#'"
                    class="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-navy hover:bg-white hover:border-primary-200 hover:shadow-lg transition-all"
                    :title="user?.role === 'CUSTOMER' ? 'Edit Profil' : 'Profil'"
                  >
                    <img 
                      v-if="user?.avatarUrl"
                      :src="user.avatarUrl"
                      :alt="user.name"
                      class="w-full h-full object-cover rounded-2xl"
                    />
                    <Icon v-else name="heroicons:user-20-solid" class="w-6 h-6" />
                  </NuxtLink>
               </div>

               <button 
                @click="logout" 
                class="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                title="Logout"
               >
                 <Icon name="heroicons:arrow-right-on-rectangle-20-solid" class="w-6 h-6" />
               </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
