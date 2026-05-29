<script setup>

const config = useRuntimeConfig()
const { user } = useAuth()
const { $socket } = useNuxtApp()

const isLoading = ref(true)
const inbox = ref([])

const loadInbox = async () => {
  if (!user.value?.id) return
  isLoading.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/chat/inbox`, {
      query: {
        userId: user.value.id,
        role: 'CUSTOMER'
      }
    })
    if (res.success) inbox.value = res.data
  } catch (e) {
    console.error('Gagal memuat inbox:', e)
  } finally {
    isLoading.value = false
  }
}

const getLastMessage = (room) => {
  const msg = room.messages?.[0]
  if (!msg) return 'Belum ada pesan'
  return msg.message.length > 60 ? msg.message.slice(0, 60) + '...' : msg.message
}

const getLastTime = (room) => {
  const msg = room.messages?.[0]
  if (!msg) return ''
  const d = new Date(msg.createdAt)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const getMitraAvatar = (room) => {
  return room.mitra?.photos?.[0]?.photoUrl || null
}

onMounted(() => {
  loadInbox()

  // Real-time: update inbox when new message arrives
  $socket.on('receive_message', () => {
    loadInbox()
  })
})

onUnmounted(() => {
  $socket.off('receive_message')
})

useHead({ title: 'Inbox Pesan — RentPS' })
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 py-10 px-4">
    <div class="max-w-3xl mx-auto space-y-8">

      <!-- Header -->
      <div>
        <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Inbox</h1>
        <p class="text-slate-500 text-sm font-medium mt-1">Percakapan kamu dengan para mitra rental.</p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4 animate-pulse">
          <div class="w-12 h-12 rounded-lg bg-slate-200 flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="w-40 h-4 bg-slate-200 rounded" />
            <div class="w-64 h-3 bg-slate-100 rounded" />
          </div>
          <div class="w-10 h-3 bg-slate-100 rounded" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="inbox.length === 0" class="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50">
        <div class="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:chat-bubble-oval-left-ellipsis-20-solid" class="w-8 h-8 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-navy">Belum Ada Pesan</h3>
        <p class="text-slate-500 text-sm font-medium mt-1 max-w-sm mx-auto">Mulai chat dengan mitra rental favoritmu untuk bertanya seputar unit PS dan ketersediaan jadwal.</p>
        <NuxtLink to="/" class="mt-6 inline-flex items-center gap-2 bg-navy hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-sm">
          Jelajahi Rental
          <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Inbox List -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="room in inbox"
          :key="room.id"
          :to="`/chat/${room.mitraId}`"
          class="group bg-white rounded-xl px-5 py-4 border border-slate-200 flex items-center gap-4 hover:border-primary-200 hover:shadow-md transition-all duration-300"
        >
          <!-- Avatar -->
          <div class="w-12 h-12 rounded-lg bg-navy flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
            <img
              v-if="getMitraAvatar(room)"
              :src="getMitraAvatar(room)"
              :alt="room.mitra?.shopName"
              class="w-full h-full object-cover"
            />
            <Icon v-else name="heroicons:building-storefront-20-solid" class="w-6 h-6 text-primary-400" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-bold text-navy text-base truncate group-hover:text-primary-600 transition-colors">{{ room.mitra?.shopName || 'Mitra PS' }}</p>
            <p class="text-slate-500 text-xs font-medium truncate mt-0.5">{{ getLastMessage(room) }}</p>
          </div>

          <!-- Time + Arrow -->
          <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span class="text-xs font-medium text-slate-400">{{ getLastTime(room) }}</span>
            <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors" />
          </div>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid theme('colors.primary.400');
  outline-offset: 2px;
}
</style>
