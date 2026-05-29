<script setup>
const route = useRoute()
const isAuthPage = computed(() => route.path.startsWith('/auth'))
const isAdminPage = computed(() => route.path.startsWith('/admin'))
const isMitraPage = computed(() => route.path.startsWith('/mitra/dashboard'))
const isCustPage = computed(() => route.path.startsWith('/user/profile') || route.path.startsWith('/user/inbox') || route.path.startsWith('/chat'))
</script>

<template>
  <div class="min-h-screen flex selection:bg-primary-500 selection:text-navy">
    <!-- Admin Layout -->
    <template v-if="isAdminPage && !isAuthPage">
      <TheAdminSidebar />
      <main class="flex-grow overflow-y-auto h-screen bg-gray-50/30">
        <NuxtPage />
      </main>
    </template>

    <!-- Normal Layout -->
    <template v-else>
      <div class="flex flex-col w-full">
        <TheNavbar v-if="!isAuthPage" />
        <main class="flex-grow overflow-x-hidden pt-3">
          <NuxtPage />
        </main>
        <TheFooter v-if="!isAuthPage" />
        <TheChatbot v-if="!isAuthPage && !isAdminPage && !isMitraPage && !isCustPage"  />
      </div>
    </template>
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
