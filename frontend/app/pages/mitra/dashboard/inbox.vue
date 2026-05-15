<script setup>

const config = useRuntimeConfig()
const { user } = useAuth()
const { $socket } = useNuxtApp()

const isLoading = ref(true)
const inbox = ref([])
const mitraProfileId = ref(null)

const loadMitraId = async () => {
  try {
    const res = await $fetch(`${config.public.apiBase}/mitra/stats`, {
      query: { userId: user.value?.id }
    })
    if (res.success) mitraProfileId.value = res.data.mitraId
  } catch (e) {
    console.error('Gagal memuat mitra id:', e)
  }
}

const loadInbox = async () => {
  if (!mitraProfileId.value) return
  isLoading.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/chat/inbox`, {
      query: {
        userId: user.value?.id,
        role: 'MITRA',
        mitraProfileId: mitraProfileId.value
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
  return msg.message.length > 65 ? msg.message.slice(0, 65) + '...' : msg.message
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

const getCustomerAvatar = (room) => room.customer?.userProfile?.avatarUrl || null
const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

onMounted(async () => {
  await loadMitraId()
  await loadInbox()

  $socket.on('receive_message', () => {
    loadInbox()
  })
})

onUnmounted(() => {
  $socket.off('receive_message')
})

useHead({ title: 'Inbox Pesan — RentPS Dashboard' })
</script>

<template>
  <div class="p-4 md:p-10 space-y-8 bg-gray-50/30 min-h-screen">
    <div class="max-w-3xl">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-black text-navy tracking-tight">Inbox Pesan</h1>
        <p class="text-gray-500 font-medium mt-1">Percakapan masuk dari para pelanggan.</p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded-[28px] p-5 border border-gray-100 flex items-center gap-4 animate-pulse">
          <div class="w-14 h-14 rounded-2xl bg-gray-200 flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="w-36 h-4 bg-gray-200 rounded-full" />
            <div class="w-56 h-3 bg-gray-100 rounded-full" />
          </div>
          <div class="w-10 h-3 bg-gray-100 rounded-full" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="inbox.length === 0" class="text-center py-28 bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Icon name="heroicons:chat-bubble-oval-left-ellipsis" class="w-12 h-12 text-gray-200" />
        </div>
        <h3 class="text-2xl font-black text-navy mb-3 tracking-tight">Belum Ada Pesan Masuk</h3>
        <p class="text-gray-500 font-medium max-w-sm mx-auto text-sm">Pelanggan belum menghubungi Anda. Pesan yang masuk dari customer akan tampil di sini.</p>
      </div>

      <!-- Inbox List -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="room in inbox"
          :key="room.id"
          :to="`/mitra/dashboard/chat/${room.customerId}`"
          class="group bg-white rounded-[28px] px-5 py-4 border border-gray-100 flex items-center gap-4 shadow-sm hover:border-primary-200 hover:shadow-md hover:shadow-navy/5 transition-all duration-300"
        >
          <!-- Avatar Customer -->
          <div class="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
            :class="getCustomerAvatar(room) ? '' : 'bg-primary-100'"
          >
            <img
              v-if="getCustomerAvatar(room)"
              :src="getCustomerAvatar(room)"
              :alt="room.customer?.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-2xl font-black text-primary-600">{{ getInitial(room.customer?.name) }}</span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-black text-navy text-base truncate group-hover:text-primary-600 transition-colors">{{ room.customer?.name || 'Pelanggan' }}</p>
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
