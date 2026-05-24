<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const { user, token } = useAuth()
const { $socket } = useNuxtApp()

const mitraId = computed(() => route.params.mitraId)
const currentUserId = computed(() => user.value?.id)

const room = ref(null)
const messages = ref([])
const newMessage = ref('')
const isSending = ref(false)
const isLoading = ref(true)
const chatBottom = ref(null)
const mitraInfo = ref(null)

// Fetch room + message history
const loadRoom = async () => {
  if (!currentUserId.value || !mitraId.value) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/chat/room/${currentUserId.value}/${mitraId.value}`)
    if (res && res.success) {
      room.value = res.data
      messages.value = res.data.messages || []
    }
  } catch (e) {
    console.error('Gagal memuat chat:', e)
  } finally {
    isLoading.value = false
  }
}

// Watch for user data if it arrives late
watch(currentUserId, (newId) => {
  if (newId && !room.value) loadRoom()
})

// Fetch mitra shop info
const loadMitraInfo = async () => {
  try {
    const res = await $fetch(`${config.public.apiBase}/mitra/${mitraId.value}`)
    if (res.success) mitraInfo.value = res.data
  } catch (e) {
    console.error('Gagal memuat info mitra:', e)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatBottom.value) {
    chatBottom.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const sendMessage = async () => {
  console.log('Mencoba mengirim pesan...', { roomId: room.value?.id, senderId: currentUserId.value, message: newMessage.value })
  if (!newMessage.value.trim() || !room.value || isSending.value) {
    console.warn('Gagal kirim: data tidak lengkap atau sedang mengirim')
    return
  }
  
  const messageText = newMessage.value.trim()
  newMessage.value = '' // Clear immediately for better UX
  isSending.value = true

  try {
    const res = await $fetch(`${config.public.apiBase}/chat/message`, {
      method: 'POST',
      body: {
        roomId: room.value.id,
        senderId: currentUserId.value,
        message: messageText
      }
    })

    if (res.success) {
      console.log('Pesan tersimpan via REST, menyiarkan via socket...')
      // Update UI local dulu agar cepat
      messages.value.push(res.data)
      scrollToBottom()
      
      if ($socket?.emit) {
        $socket.emit('send_message', res.data)
      } else {
        console.warn('Socket belum siap, tapi pesan sudah tersimpan di DB.')
      }
    }
  } catch (e) {
    console.error('Gagal mengirim pesan:', e)
    newMessage.value = messageText // Restore if failed
    // Ambil pesan error detail jika ada
    const errorMsg = e.response?._data?.message || e.message || 'Error tidak dikenal'
    alert('Gagal mengirim pesan: ' + errorMsg)
  } finally {
    isSending.value = false
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hari Ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Group messages by date
const groupedMessages = computed(() => {
  const groups = []
  let lastDate = null
  for (const msg of messages.value) {
    const dateLabel = formatDate(msg.createdAt)
    if (dateLabel !== lastDate) {
      groups.push({ type: 'date', label: dateLabel })
      lastDate = dateLabel
    }
    groups.push({ type: 'message', ...msg })
  }
  return groups
})

onMounted(async () => {
  await loadRoom()
  await loadMitraInfo()
  scrollToBottom()

  if ($socket) {
    const handleReceive = (msg) => {
      console.log('[Socket] Menerima pesan baru:', msg)
      // Cek apakah pesan sudah ada di list (mencegah duplikat karena kita push manual saat kirim)
      const exists = messages.value.find(m => m.id === msg.id)
      if (!exists && msg.roomId === room.value?.id) {
        messages.value.push(msg)
        scrollToBottom()
      }
    }

    $socket.on('receive_message', handleReceive)

    // Re-join jika putus nyambung
    $socket.on('connect', () => {
      if (room.value) {
        console.log('[Socket] Re-joining room:', room.value.id)
        $socket.emit('join_room', room.value.id)
      }
    })

    if (room.value) {
      console.log('[Socket] Joining room:', room.value.id)
      $socket.emit('join_room', room.value.id)
    }
  }
})

onUnmounted(() => {
  if ($socket) {
    $socket.off('receive_message')
    $socket.off('connect')
  }
})

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

useHead({
  title: computed(() => `Chat dengan ${mitraInfo.value?.shopName || 'Mitra'} — RentPS`)
})
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">

    <!-- Header -->
    <div class="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
        <NuxtLink to="/user/inbox" class="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100">
          <Icon name="heroicons:arrow-left-20-solid" class="w-5 h-5 text-navy" />
        </NuxtLink>

        <div class="w-11 h-11 rounded-2xl bg-navy flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
          <img
            v-if="mitraInfo?.photos?.[0]?.photoUrl"
            :src="mitraInfo.photos[0].photoUrl"
            :alt="mitraInfo.shopName"
            class="w-full h-full object-cover"
          />
          <Icon v-else name="heroicons:building-storefront-20-solid" class="w-6 h-6 text-primary-400" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-black text-navy text-base leading-tight truncate">{{ mitraInfo?.shopName || 'Mitra' }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <p class="text-xs font-semibold text-green-500">Online</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-3xl mx-auto px-4 py-6 space-y-1">

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col gap-4 mt-8">
          <div v-for="i in 5" :key="i" :class="['flex gap-3', i % 2 === 0 ? 'flex-row-reverse' : '']">
            <div class="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div :class="['h-12 rounded-3xl animate-pulse', i % 2 === 0 ? 'w-48 bg-navy/20' : 'w-64 bg-gray-200']" />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6">
            <Icon name="heroicons:chat-bubble-left-right-20-solid" class="w-10 h-10 text-primary-400" />
          </div>
          <h3 class="font-black text-navy text-xl mb-2">Mulai Percakapan!</h3>
          <p class="text-gray-400 font-medium text-sm max-w-xs">Tanya soal ketersediaan unit, harga, atau info lainnya langsung ke mitra.</p>
        </div>

        <!-- Message Groups -->
        <template v-else>
          <template v-for="(item, idx) in groupedMessages" :key="idx">
            <!-- Date Divider -->
            <div v-if="item.type === 'date'" class="flex items-center gap-3 py-4">
              <div class="flex-1 h-px bg-gray-100" />
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-gray-100 rounded-full">{{ item.label }}</span>
              <div class="flex-1 h-px bg-gray-100" />
            </div>

            <!-- Message Bubble -->
            <div
              v-else-if="item.type === 'message'"
              :class="['flex gap-3 items-end mb-2', item.senderId === currentUserId ? 'flex-row-reverse' : 'flex-row']"
            >
              <!-- Avatar -->
              <div
                v-if="item.senderId !== currentUserId"
                class="w-8 h-8 rounded-2xl bg-navy flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md mb-1"
              >
                <img
                  v-if="mitraInfo?.photos?.[0]?.photoUrl"
                  :src="mitraInfo.photos[0].photoUrl"
                  class="w-full h-full object-cover"
                />
                <Icon v-else name="heroicons:building-storefront-20-solid" class="w-4 h-4 text-primary-400" />
              </div>

              <!-- Bubble -->
              <div :class="['max-w-[70%] group', item.senderId === currentUserId ? 'items-end' : 'items-start', 'flex flex-col']">
                <div
                  :class="[
                    'px-5 py-3 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm',
                    item.senderId === currentUserId
                      ? 'bg-navy text-white rounded-br-lg shadow-navy/20'
                      : 'bg-white text-navy border border-gray-100 rounded-bl-lg'
                  ]"
                >
                  {{ item.message }}
                </div>
                <span class="text-[10px] text-gray-400 font-semibold mt-1 px-1">{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>
          </template>

          <div ref="chatBottom" class="h-1" />
        </template>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex-shrink-0 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <div class="flex items-end gap-3">
          <div class="flex-1 bg-gray-50 border-2 border-gray-100 rounded-3xl px-5 py-3 focus-within:border-primary-400 focus-within:bg-white transition-all">
            <textarea
              v-model="newMessage"
              @keydown="handleKeydown"
              placeholder="Ketik pesan..."
              rows="1"
              class="w-full bg-transparent text-navy font-semibold text-sm resize-none focus:outline-none placeholder-gray-400 leading-relaxed max-h-32"
              style="min-height: 24px;"
            />
          </div>
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || isSending"
            class="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center shadow-lg shadow-navy/20 hover:bg-primary-500 hover:text-navy transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Icon name="heroicons:paper-airplane-20-solid" class="w-5 h-5" />
          </button>
        </div>
        <p class="text-[10px] text-gray-400 font-semibold mt-2 ml-1">Tekan Enter untuk kirim · Shift+Enter untuk baris baru</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
textarea {
  field-sizing: content;
}
</style>
