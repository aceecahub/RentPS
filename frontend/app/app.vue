<script setup>
const route = useRoute()
const isAuthPage = computed(() => route.path.startsWith('/auth'))
</script>

<template>
  <div class="min-h-screen flex flex-col selection:bg-primary-500 selection:text-navy">
    <TheNavbar v-if="!isAuthPage" />
    <main class="flex-grow overflow-x-hidden">
      <NuxtPage />
    </main>
    <TheFooter v-if="!isAuthPage" />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(10px);
  transform: translateY(20px);
}
</style>
