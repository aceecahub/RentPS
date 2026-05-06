<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

if (!isLoggedIn.value || user.value?.role !== 'MITRA') {
  navigateTo('/')
}

const period = ref('month')
const startDate = ref('')
const endDate = ref('')

const { data: mitraRes } = await useFetch(`${config.public.apiBase}/mitra/stats`, {
  query: { userId: user.value?.id }
})

const mitraId = computed(() => mitraRes.value?.data?.mitraId)

const { data: incomeRes, pending, refresh } = await useFetch(() => `${config.public.apiBase}/mitra/income/${mitraId.value}`, {
  query: { 
    period: period.value,
    startDate: startDate.value,
    endDate: endDate.value
  },
  watch: [period, startDate, endDate]
})

const incomeData = computed(() => incomeRes.value?.data || {
  totalIncome: 0,
  psIncome: 0,
  snackIncome: 0,
  bookingCount: 0
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const setPeriod = (p) => {
  period.value = p
  startDate.value = ''
  endDate.value = ''
}
</script>

<template>
  <div class="p-4 md:p-10 space-y-12 bg-gray-50/30 min-h-screen">
    <!-- Header -->
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="flex items-center space-x-6">
        <NuxtLink to="/mitra/dashboard" class="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-navy shadow-sm hover:shadow-lg transition-all hover:-translate-x-1 group">
          <Icon name="heroicons:arrow-left-20-solid" class="w-6 h-6 group-hover:text-primary-500 transition-colors" />
        </NuxtLink>
        <div>
          <h1 class="text-4xl font-black text-navy tracking-tight">Laporan Pendapatan</h1>
          <p class="text-gray-500 font-medium mt-1">Analisis keuangan dan performa bisnis Anda.</p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto space-y-10">
      <!-- Filters -->
      <div class="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-navy/5 flex flex-wrap items-center gap-6">
        <div class="flex bg-gray-50 p-2 rounded-2xl">
          <button 
            @click="setPeriod('day')"
            class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="period === 'day' ? 'bg-navy text-white shadow-lg' : 'text-gray-400 hover:text-navy'"
          >
            Hari Ini
          </button>
          <button 
            @click="setPeriod('month')"
            class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="period === 'month' ? 'bg-navy text-white shadow-lg' : 'text-gray-400 hover:text-navy'"
          >
            Bulan Ini
          </button>
          <button 
            @click="setPeriod('year')"
            class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="period === 'year' ? 'bg-navy text-white shadow-lg' : 'text-gray-400 hover:text-navy'"
          >
            Tahun Ini
          </button>
        </div>

        <div class="h-10 w-px bg-gray-100 hidden md:block"></div>

        <div class="flex items-center gap-4 flex-1">
          <div class="relative flex-1 max-w-[200px]">
            <input 
              type="date" 
              v-model="startDate"
              class="w-full bg-gray-50 border-2 border-transparent focus:border-navy rounded-2xl px-5 py-3 text-sm font-bold text-navy outline-none transition-all"
              @change="period = 'custom'"
            />
          </div>
          <Icon name="heroicons:arrow-right-20-solid" class="text-gray-300" />
          <div class="relative flex-1 max-w-[200px]">
            <input 
              type="date" 
              v-model="endDate"
              class="w-full bg-gray-50 border-2 border-transparent focus:border-navy rounded-2xl px-5 py-3 text-sm font-bold text-navy outline-none transition-all"
              @change="period = 'custom'"
            />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-navy p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl group transition-all hover:-translate-y-2">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/20 blur-[60px] rounded-full group-hover:bg-primary-500/30 transition-all"></div>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Total Pendapatan</p>
          <div v-if="pending" class="h-10 w-48 bg-white/10 animate-pulse rounded-xl"></div>
          <h2 v-else class="text-4xl font-black tracking-tight mb-8">{{ formatCurrency(incomeData.totalIncome) }}</h2>
          <div class="flex items-center text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl border border-white/10">
            <Icon name="heroicons:chart-bar-20-solid" class="mr-2 text-primary-500" />
            {{ incomeData.bookingCount }} Transaksi Selesai
          </div>
        </div>

        <div class="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5 group transition-all hover:-translate-y-2">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/5">
            <Icon name="heroicons:computer-desktop-20-solid" class="w-7 h-7" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Pendapatan PlayStation</p>
          <div v-if="pending" class="h-8 w-36 bg-gray-100 animate-pulse rounded-xl"></div>
          <h3 v-else class="text-3xl font-black text-navy tracking-tight">{{ formatCurrency(incomeData.psIncome) }}</h3>
          <div class="mt-6 h-2 bg-gray-50 rounded-full overflow-hidden">
            <div 
              class="h-full bg-blue-500 transition-all duration-1000" 
              :style="{ width: `${(incomeData.psIncome / incomeData.totalIncome) * 100 || 0}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5 group transition-all hover:-translate-y-2">
          <div class="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/5">
            <Icon name="heroicons:shopping-cart-20-solid" class="w-7 h-7" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Pendapatan Snack</p>
          <div v-if="pending" class="h-8 w-36 bg-gray-100 animate-pulse rounded-xl"></div>
          <h3 v-else class="text-3xl font-black text-navy tracking-tight">{{ formatCurrency(incomeData.snackIncome) }}</h3>
          <div class="mt-6 h-2 bg-gray-50 rounded-full overflow-hidden">
            <div 
              class="h-full bg-orange-500 transition-all duration-1000" 
              :style="{ width: `${(incomeData.snackIncome / incomeData.totalIncome) * 100 || 0}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Details Table / Chart Placeholder -->
      <div class="bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5 p-12 text-center">
        <div class="max-w-2xl mx-auto space-y-6">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="heroicons:presentation-chart-line" class="w-10 h-10 text-gray-300" />
          </div>
          <h3 class="text-2xl font-black text-navy tracking-tight">Visualisasi Data</h3>
          <p class="text-gray-500 font-medium leading-relaxed">
            Pendapatan Anda didominasi oleh <span class="text-navy font-bold">{{ incomeData.psIncome > incomeData.snackIncome ? 'Sewa PlayStation' : 'Penjualan Snack' }}</span>. 
            Terus tingkatkan layanan Anda untuk memaksimalkan profit.
          </p>
          <div class="grid grid-cols-2 gap-4 pt-6">
            <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rasio PS</p>
              <p class="text-xl font-black text-navy">{{ Math.round((incomeData.psIncome / incomeData.totalIncome) * 100) || 0 }}%</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rasio Snack</p>
              <p class="text-xl font-black text-navy">{{ Math.round((incomeData.snackIncome / incomeData.totalIncome) * 100) || 0 }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
