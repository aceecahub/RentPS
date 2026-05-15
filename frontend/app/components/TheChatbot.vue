<script setup>
import { ref, nextTick } from 'vue';
import { useRuntimeConfig } from '#app';

const isOpen = ref(false);
const messages = ref([
  { id: 1, text: 'Halo! Selamat datang di Layanan Sewa PS Tasikmalaya. Ada yang bisa dibantu?', sender: 'bot' }
]);
const inputMessage = ref('');
const messagesContainer = ref(null);
const isLoading = ref(false);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  const text = inputMessage.value.trim();
  if (!text) return;
  
  // Add user message
  messages.value.push({
    id: Date.now(),
    text,
    sender: 'user'
  });
  
  inputMessage.value = '';
  await scrollToBottom();
  
  isLoading.value = true;
  
  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBase || '/api';
    // Gunakan apiBase langsung, jika apiBase sudah '/api', jadinya '/api/chatbot'
    // Jika tidak pakai useRuntimeConfig, gunakan '/api/chatbot'
    const endpoint = apiBase.endsWith('/api') ? `${apiBase}/chatbot` : `${apiBase}/api/chatbot`;
    
    const response = await $fetch(endpoint, {
      method: 'POST',
      body: { message: text }
    });
    
    messages.value.push({
      id: Date.now(),
      text: response.response,
      sender: 'bot'
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    messages.value.push({
      id: Date.now(),
      text: 'Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.',
      sender: 'bot'
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat Window -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-4"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-4"
    >
      <div v-if="isOpen" class="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl mb-4 border border-gray-100 overflow-hidden flex flex-col h-[500px] max-h-[80vh]">
        <!-- Header -->
        <div class="bg-primary-600 text-white p-4 flex justify-between items-center shadow-md z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span class="text-xl">🤖</span>
            </div>
            <div>
              <h3 class="font-bold text-sm">RentPS Assistant</h3>
              <p class="text-xs text-primary-100">Online</p>
            </div>
          </div>
          <button @click="toggleChat" class="text-white hover:bg-white/20 p-2 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
          <div v-for="msg in messages" :key="msg.id" 
               class="max-w-[85%] rounded-2xl px-4 py-2 shadow-sm text-sm"
               :class="msg.sender === 'user' ? 'bg-primary-500 text-white self-end rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 self-start rounded-tl-sm'">
            <!-- Handle newlines in bot responses -->
            <div class="whitespace-pre-line">{{ msg.text }}</div>
          </div>
          
          <!-- Loading Indicator -->
          <div v-if="isLoading" class="bg-white border border-gray-100 self-start rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
        
        <!-- Input Area -->
        <div class="p-3 bg-white border-t border-gray-100">
          <form @submit.prevent="sendMessage" class="flex gap-2 relative">
            <input 
              v-model="inputMessage" 
              type="text" 
              placeholder="Ketik pesan Anda..." 
              class="flex-1 bg-gray-100 rounded-full py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 text-sm transition-shadow"
              :disabled="isLoading"
            />
            <button 
              type="submit" 
              class="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-11 h-11 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!inputMessage.trim() || isLoading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-1">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </Transition>
    
    <!-- Floating Button -->
    <button 
      @click="toggleChat"
      class="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group relative"
      :class="isOpen ? 'scale-0' : 'scale-100'"
    >
      <span class="absolute right-0 top-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>
  </div>
</template>
