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
  <div class="min-h-screen bg-gray-50/30 p-4 md:p-10">
    <div class="max-w-3xl mx-auto space-y-8">

      <!-- Header -->
      <div>
        <h1 class="text-4xl font-black text-navy tracking-tight">Inbox</h1>
        <p class="text-gray-500 font-medium mt-1">Percakapan kamu dengan para mitra rental.</p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="bg-white rounded-[28px] p-5 border border-gray-100 flex items-center gap-4 animate-pulse">
          <div class="w-14 h-14 rounded-2xl bg-gray-200 flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="w-40 h-4 bg-gray-200 rounded-full" />
            <div class="w-64 h-3 bg-gray-100 rounded-full" />
          </div>
          <div class="w-10 h-3 bg-gray-100 rounded-full" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="inbox.length === 0" class="text-center py-28 bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Icon name="heroicons:chat-bubble-oval-left-ellipsis" class="w-12 h-12 text-gray-200" />
        </div>
        <h3 class="text-2xl font-black text-navy mb-3 tracking-tight">Belum Ada Pesan</h3>
        <p class="text-gray-500 font-medium mb-10 max-w-sm mx-auto text-sm">Mulai chat dengan mitra rental favoritmu untuk bertanya seputar unit PS dan ketersediaan jadwal.</p>
        <NuxtLink to="/" class="bg-navy text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-navy/20 hover:bg-primary-500 hover:text-navy transition-all active:scale-95 inline-flex items-center gap-2">
          Jelajahi Rental
          <Icon name="heroicons:arrow-right-20-solid" class="w-5 h-5" />
        </NuxtLink>
      </div>

      <!-- Inbox List -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="room in inbox"
          :key="room.id"
          :to="`/chat/${room.mitraId}`"
          class="group bg-white rounded-[28px] px-5 py-4 border border-gray-100 flex items-center gap-4 shadow-sm hover:border-primary-200 hover:shadow-md hover:shadow-navy/5 transition-all duration-300"
        >
          <!-- Avatar -->
          <div class="w-14 h-14 rounded-2xl bg-navy flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <img
              v-if="getMitraAvatar(room)"
              :src="getMitraAvatar(room)"
              :alt="room.mitra?.shopName"
              class="w-full h-full object-cover"
            />
            <Icon v-else name="heroicons:building-storefront-20-solid" class="w-7 h-7 text-primary-400" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-black text-navy text-base truncate group-hover:text-primary-600 transition-colors">{{ room.mitra?.shopName || 'Mitra PS' }}</p>
            <p class="text-gray-400 text-sm font-medium truncate mt-0.5">{{ getLastMessage(room) }}</p>
          </div>

          <!-- Time + Arrow -->
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <span class="text-[11px] font-bold text-gray-400">{{ getLastTime(room) }}</span>
            <Icon name="heroicons:chevron-right-20-solid" class="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors" />
          </div>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
