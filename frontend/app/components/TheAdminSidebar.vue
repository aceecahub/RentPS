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
</script>

<<template>
  <div>
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 flex-col bg-navy">
      <!-- Logo -->
      <div class="p-6 border-b border-white/5">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:gamepad-20-solid" class="text-navy w-5 h-5" />
          </div>
          <div>
            <span class="text-lg font-black tracking-tight text-white">PlaySpace</span>
            <p class="text-[9px] font-bold text-primary-400 uppercase tracking-wider">Admin</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-grow p-4 space-y-1">
        <p class="text-[10px] font-bold text-white/30 uppercase tracking-wider px-3 mb-3">Menu</p>
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all"
          :class="isActive(item)
            ? 'bg-primary-500 text-navy'
            : 'text-white/60 hover:text-white hover:bg-white/5'"
        >
          <Icon :name="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User Footer -->
      <div class="p-4 border-t border-white/5">
        <div class="bg-white/5 rounded-lg p-3 flex items-center gap-3">
          <div class="w-9 h-9 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
            {{ user?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-white font-bold text-sm truncate">{{ user?.name }}</p>
            <p class="text-white/30 text-[10px] font-bold uppercase tracking-wider">Administrator</p>
          </div>
          <button
            @click="logout"
            class="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all"
          >
            <Icon name="heroicons:arrow-right-on-rectangle-20-solid" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Bottom Nav -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy border-t border-white/10">
      <div class="flex items-center justify-around px-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center py-2 px-3 min-w-[64px]"
          :class="isActive(item) ? 'text-primary-400' : 'text-white/40'"
        >
          <Icon :name="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-bold mt-0.5">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>