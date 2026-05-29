<script setup>
const config = useRuntimeConfig()
const { user, token, isLoggedIn } = useAuth()

if (!isLoggedIn.value) {
  navigateTo('/auth/login')
}

const { data: response, pending, refresh } = await useFetch(`${config.public.apiBase}/booking/user`, {
  key: 'user-all-bookings',
  query: computed(() => ({ userId: user.value?.id })),
  headers: useRequestHeaders(['cookie']),
  watch: [user]
})

const bookings = computed(() => response.value?.data || [])

const getStatusClasses = (status) => {
  const map = {
    WAITING_PAYMENT: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    ONGOING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  }
  return map[status] || 'bg-slate-50 text-slate-600 border-slate-200'
}

const getStatusLabel = (status) => {
  const map = {
    WAITING_PAYMENT: 'Menunggu Pembayaran',
    CONFIRMED: 'Terkonfirmasi',
    ONGOING: 'Sedang Berlangsung',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return map[status] || status
}

const payNow = async (bookingId) => {
  try {
    const res = await $fetch(`${config.public.apiBase}/payment/create-transaction`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: { bookingId }
    })

    if (res.token) {
      window.snap.pay(res.token, {
        onSuccess: (result) => {
          console.log('success', result)
          refresh()
        },
        onPending: (result) => {
          console.log('pending', result)
          refresh()
        },
        onError: (result) => {
          console.log('error', result)
          alert('Pembayaran gagal')
        },
        onClose: () => {
          console.log('customer closed the popup without finishing the payment')
        }
      })
    }
  } catch (error) {
    console.error('Payment error:', error)
    alert('Gagal membuat transaksi')
  }
}

// Review Logic
const isReviewModalOpen = ref(false)
const selectedBooking = ref(null)
const reviewForm = reactive({
  rating: 5,
  comment: ''
})
const isSubmittingReview = ref(false)

const openReviewModal = (booking) => {
  selectedBooking.value = booking
  reviewForm.rating = 5
  reviewForm.comment = ''
  isReviewModalOpen.value = true
}

const submitReview = async () => {
  if (!selectedBooking.value) return
  
  isSubmittingReview.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/booking/${selectedBooking.value.id}/review`, {
      method: 'POST',
      body: {
        ...reviewForm,
        userId: user.value.id
      }
    })
    
    if (res.success) {
      alert('Terima kasih atas ulasan Anda!')
      isReviewModalOpen.value = false
      refresh()
    }
  } catch (error) {
    alert(error.response?._data?.message || 'Gagal mengirim ulasan')
  } finally {
    isSubmittingReview.value = false
  }
}
</script>

<<template>
  <div class="min-h-screen bg-slate-50/50 py-10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black text-navy tracking-tight">Riwayat Booking</h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Pantau status penyewaan PlayStation Anda.</p>
        </div>
        <div class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Icon name="heroicons:funnel-20-solid" class="w-4 h-4 text-slate-400" />
          <span class="text-xs font-bold text-navy">Semua Status</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-40 bg-white border border-slate-100 rounded-xl animate-pulse"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="bookings.length === 0" class="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <div class="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:calendar-days-20-solid" class="w-8 h-8 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-navy">Belum Ada Aktivitas</h3>
        <p class="text-slate-500 text-sm font-medium mt-1 max-w-sm mx-auto">Anda belum memiliki riwayat penyewaan. Temukan rental PS terdekat dan mulai bermain!</p>
        <NuxtLink to="/" class="mt-6 inline-flex items-center gap-2 bg-navy hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95">
          Jelajahi Rental PS
          <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Booking List -->
      <div v-else class="space-y-4">
        <div 
          v-for="booking in bookings" 
          :key="booking.id"
          class="bg-white rounded-xl border border-slate-200 hover:border-primary-200 transition-all duration-300 overflow-hidden"
        >
          <div class="p-5 lg:p-6">
            <!-- Top: ID & Status -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-5 border-b border-slate-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-navy rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:ticket-20-solid" class="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#BK-{{ booking.id.toString().padStart(4, '0') }}</p>
                  <h3 class="text-base font-bold text-navy">{{ booking.mitra?.shopName || 'Mitra PS' }}</h3>
                </div>
              </div>
              <span 
                class="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border self-start"
                :class="getStatusClasses(booking.status)"
              >
                {{ getStatusLabel(booking.status) }}
              </span>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Unit & Durasi</p>
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:computer-desktop-20-solid" class="w-4 h-4 text-slate-400" />
                  <div>
                    <p class="text-sm font-bold text-navy">{{ booking.unit?.name || 'Unit PS' }}</p>
                    <p class="text-xs text-slate-500 font-medium">{{ booking.durationHour }} jam</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Waktu Sewa</p>
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:clock-20-solid" class="w-4 h-4 text-slate-400" />
                  <div>
                    <p class="text-sm font-bold text-navy">{{ new Date(booking.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
                    <p class="text-xs text-slate-500 font-medium">{{ new Date(booking.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} WIB</p>
                  </div>
                </div>
              </div>

              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Penyewa</p>
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:user-20-solid" class="w-4 h-4 text-slate-400" />
                  <div>
                    <p class="text-sm font-bold text-navy">{{ booking.renterName }}</p>
                    <p class="text-xs text-slate-500 font-medium">{{ booking.renterPhone }}</p>
                  </div>
                </div>
              </div>

              <div class="lg:text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total</p>
                <p class="text-xl font-black text-navy">Rp{{ parseFloat(booking.totalPrice).toLocaleString() }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-5 pt-5 border-t border-slate-50 flex flex-wrap gap-3">
              <button 
                v-if="booking.status === 'WAITING_PAYMENT'"
                @click="payNow(booking.id)"
                class="bg-navy hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95"
              >
                Bayar Sekarang
              </button>
              
              <button 
                v-else-if="booking.status === 'COMPLETED' && !booking.review"
                @click="openReviewModal(booking)"
                class="bg-primary-500 hover:bg-primary-600 text-navy px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Icon name="heroicons:star-solid" class="w-4 h-4" />
                Beri Rating
              </button>
              
              <div 
                v-else-if="booking.review"
                class="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div class="flex items-center gap-0.5">
                  <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" :class="['w-3.5 h-3.5', i <= booking.review.rating ? 'text-yellow-400' : 'text-slate-200']" />
                </div>
                <span class="text-xs text-slate-500 font-medium truncate max-w-[150px]">"{{ booking.review.comment }}"</span>
              </div>
              
              <NuxtLink 
                :to="`/mitra/${booking.mitraId}`"
                class="ml-auto text-slate-400 hover:text-navy text-sm font-medium transition-colors flex items-center gap-1"
              >
                Lihat Mitra
                <Icon name="heroicons:arrow-right-20-solid" class="w-3.5 h-3.5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="isReviewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6 space-y-6">
          <div class="text-center">
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon name="heroicons:chat-bubble-left-right-20-solid" class="w-6 h-6 text-primary-500" />
            </div>
            <h2 class="text-xl font-black text-navy">Bagaimana Pengalamanmu?</h2>
            <p class="text-slate-500 text-sm font-medium mt-1">{{ selectedBooking?.mitra?.shopName }}</p>
          </div>

          <!-- Stars -->
          <div class="flex justify-center items-center gap-2">
            <button 
              v-for="star in 5" 
              :key="star"
              @click="reviewForm.rating = star"
              class="transition-transform hover:scale-110"
            >
              <Icon 
                :name="star <= reviewForm.rating ? 'heroicons:star-solid' : 'heroicons:star-20-solid'" 
                :class="['w-10 h-10', star <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-200']" 
              />
            </button>
          </div>

          <!-- Comment -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Ulasan</label>
            <textarea 
              v-model="reviewForm.comment"
              placeholder="Ceritakan pengalaman bermainmu..."
              class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 min-h-[100px] text-navy font-medium text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button 
              @click="isReviewModalOpen = false"
              class="flex-1 px-4 py-3 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200"
            >
              Batal
            </button>
            <button 
              @click="submitReview"
              :disabled="isSubmittingReview"
              class="flex-[2] bg-navy hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="isSubmittingReview" name="svg-spinners:ring-resize" class="w-4 h-4" />
              <span>Kirim Ulasan</span>
            </button>
          </div>
        </div>
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