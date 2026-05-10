<template>
    <!-- Footer Mini -->
    <footer class="border-t border-slate-100 py-7">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-slate-400 text-sm font-medium">© 2024 PSBook. All rights reserved.</p>
        <div class="flex items-center space-x-5">
          <NuxtLink v-for="item in ['Privacy', 'Terms', 'Contact']" :key="item" 
            :to="`/${item.toLowerCase()}`"
            class="text-slate-400 hover:text-primary-500 text-sm font-medium transition-colors"
          >
            {{ item }}
          </NuxtLink>
        </div>
      </div>
    </footer>
</template>
