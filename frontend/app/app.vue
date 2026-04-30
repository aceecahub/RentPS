<script setup>
const route = useRoute()
const isAuthPage = computed(() => route.path.startsWith('/auth'))
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TheNavbar v-if="!isAuthPage" />
    <main class="flex-grow">
      <NuxtPage />
    </main>
    <footer class="bg-gray-50 border-t border-gray-100 py-12 mt-20" v-if="!isAuthPage">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-gray-500 text-sm">&copy; 2026 RentPS. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
