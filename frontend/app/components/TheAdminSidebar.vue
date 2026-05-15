<script setup>
const { user, logout } = useAuth()
const route = useRoute()

const navItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'heroicons:squares-2x2-20-solid',
    exact: true
  },
  {
    label: 'Mitra',
    path: '/admin/dashboard/mitras',
    icon: 'heroicons:building-storefront-20-solid'
  },
  {
    label: 'User',
    path: '/admin/dashboard/users',
    icon: 'heroicons:users-20-solid'
  }
]

const isActive = (item) => {
  if (item.exact) return route.path === item.path
  return route.path.startsWith(item.path)
}

// Mobile menu state
const mobileMenuOpen = ref(false)
</script>

<template>
  <div>
    <!-- Desktop Sidebar (lg and up) -->
    <aside class="hidden lg:flex w-72 shrink-0 h-screen sticky top-0 flex-col bg-navy overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-primary-500/5 rounded-full pointer-events-none"></div>
      <div class="absolute -left-10 bottom-20 w-48 h-48 bg-primary-500/5 rounded-full pointer-events-none"></div>

      <!-- Logo -->
      <div class="p-8 pb-6 relative z-10 border-b border-white/5">
        <NuxtLink to="/" class="group flex items-center space-x-3">
          <div class="w-11 h-11 bg-primary-500 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:rotate-12 transition-transform">
            <Icon name="heroicons:bolt-20-solid" class="text-navy w-6 h-6" />
          </div>
          <span class="text-2xl font-black tracking-tighter text-white uppercase">Rent<span class="text-primary-500">PS</span></span>
        </NuxtLink>
        <div class="mt-3 flex items-center">
          <span class="bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full">
            Admin Console
          </span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-grow p-5 space-y-1.5 relative z-10">
        <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-4 mb-4">Main Menu</p>
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-2xl font-black text-sm transition-all duration-200 group relative"
          :class="isActive(item)
            ? 'bg-primary-500 text-navy shadow-xl shadow-primary-500/30'
            : 'text-white/50 hover:text-white hover:bg-white/5'"
        >
          <div class="relative">
            <Icon :name="item.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
            <div v-if="isActive(item)" class="absolute inset-0 animate-ping w-5 h-5 rounded-full bg-navy/20"></div>
          </div>
          <span class="tracking-wide">{{ item.label }}</span>
          <Icon v-if="isActive(item)" name="heroicons:chevron-right-20-solid" class="ml-auto w-4 h-4" />
        </NuxtLink>
      </nav>

      <!-- User Profile Footer -->
      <div class="p-5 relative z-10 border-t border-white/5">
        <div class="bg-white/5 rounded-2xl p-4 flex items-center space-x-4">
          <div class="w-11 h-11 bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 font-black text-lg shrink-0">
            {{ user?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-white font-black text-sm truncate">{{ user?.name }}</p>
            <p class="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Administrator</p>
          </div>
          <button
            @click="logout"
            title="Logout"
            class="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/30 hover:text-red-400 transition-all group shrink-0"
          >
            <Icon name="heroicons:arrow-right-on-rectangle-20-solid" class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Bottom Navigation (below lg) -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy border-t border-white/10 safe-area-pb">
      <div class="flex items-center justify-around px-2 ">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[64px]"
          :class="isActive(item)
            ? 'text-primary-500'
            : 'text-white/30 hover:text-white/60'"
        >
          <div class="relative">
            <Icon :name="item.icon" class="w-6 h-6" />
            <div v-if="isActive(item)" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
          </div>
          <span class="text-[10px] font-black mt-1 tracking-wide">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Safe area padding for mobile bottom nav */
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
