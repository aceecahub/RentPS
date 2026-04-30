<script setup>
const { isLoggedIn, user, logout } = useAuth()

const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Mitra', path: '/mitra' },
  { name: 'Promos', path: '/promos' },
]
</script>

<template>
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
              <Icon name="heroicons:bolt-20-solid" class="text-white w-6 h-6" />
            </div>
            <span class="text-2xl font-bold tracking-tight text-navy">Rent<span class="text-primary-500">PS</span></span>
          </NuxtLink>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            v-for="item in menuItems" 
            :key="item.path" 
            :to="item.path"
            class="text-gray-600 hover:text-navy font-medium transition-colors"
          >
            {{ item.name }}
          </NuxtLink>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center space-x-4">
          <template v-if="!isLoggedIn">
            <NuxtLink to="/auth/login" class="text-navy font-medium hover:text-navy-light transition-colors">
              Log In
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn-primary">
              Register
            </NuxtLink>
          </template>
          <template v-else>
            <div class="flex items-center space-x-4">
               <!-- Dashboard Link based on role -->
               <NuxtLink 
                 v-if="user?.role === 'CUSTOMER'" 
                 to="/user/bookings" 
                 class="text-xs font-black tracking-widest uppercase bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-all"
               >
                 Pesanan Saya
               </NuxtLink>
               <NuxtLink 
                 v-if="user?.role === 'MITRA'" 
                 to="/mitra/dashboard" 
                 class="text-xs font-black tracking-widest uppercase bg-navy text-white px-3 py-1 rounded-lg hover:bg-navy-light transition-all"
               >
                 Dashboard
               </NuxtLink>
               <NuxtLink 
                 v-if="user?.role === 'ADMIN'" 
                 to="/admin/dashboard" 
                 class="text-xs font-black tracking-widest uppercase bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-all"
               >
                 Admin Panel
               </NuxtLink>

               <div class="flex items-center space-x-3 pl-4 border-l border-gray-100">
                 <div class="text-right hidden sm:block">
                   <p class="text-xs font-bold text-navy leading-none">{{ user?.name }}</p>
                   <p class="text-[10px] text-gray-400 uppercase tracking-tighter">{{ user?.role }}</p>
                 </div>
                 <NuxtLink 
                    :to="user?.role === 'CUSTOMER' ? '/user/profile' : '#'"
                    class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-navy hover:bg-gray-100 transition-colors"
                    :title="user?.role === 'CUSTOMER' ? 'Edit Profil' : 'Profil'"
                  >
                    <Icon name="heroicons:user-circle" class="w-7 h-7" />
                  </NuxtLink>
               </div>

               <button 
                @click="logout" 
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
               ><h1>logout</h1>
                 <!-- <Icon name="heroicons:arrow-right-on-rectangle" class="w-6 h-6" /> -->
               </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
