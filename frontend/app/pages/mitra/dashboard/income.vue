<script setup>
const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()


const period = ref('month')
const startDate = ref('')
const endDate = ref('')

const { data: mitraRes } = await useFetch(`${config.public.apiBase}/mitra/stats`, {
  key: 'mitra-stats-income',
  query: computed(() => ({ userId: user.value?.id })),
  headers: useRequestHeaders(['cookie']),
  watch: [user]
})

const mitraId = computed(() => mitraRes.value?.data?.mitraId)

const { data: incomeRes, pending, refresh } = await useFetch(() => mitraId.value ? `${config.public.apiBase}/mitra/income/${mitraId.value}` : null, {
  key: `mitra-income-data`,
  query: computed(() => ({ 
    period: period.value,
    startDate: startDate.value,
    endDate: endDate.value
  })),
  headers: useRequestHeaders(['cookie']),
  watch: [period, startDate, endDate, mitraId]
})

const incomeData = computed(() => incomeRes.value?.data || {
  totalIncome: 0,
  psIncome: 0,
  snackIncome: 0,
  bookingCount: 0,
  bookings: []
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

      <!-- Sales List -->
      <div class="bg-white rounded-[48px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden">
        <div class="p-10 border-b border-gray-50 flex justify-between items-center">
          <h3 class="text-2xl font-black text-navy tracking-tight">Rincian Penjualan</h3>
          <div class="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">
            {{ incomeData.bookings.length }} Record Ditemukan
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                <th class="px-10 py-6 font-black">Waktu / Customer</th>
                <th class="px-10 py-6 font-black">Unit / Item</th>
                <th class="px-10 py-6 font-black">Pendapatan PS</th>
                <th class="px-10 py-6 font-black">Pendapatan Snack</th>
                <th class="px-10 py-6 font-black text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="sale in incomeData.bookings" :key="sale.id" class="group hover:bg-gray-50/50 transition-all">
                <td class="px-10 py-8">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy group-hover:scale-110 transition-transform">
                      <Icon name="heroicons:user-20-solid" class="w-6 h-6" />
                    </div>
                    <div>
                      <p class="font-black text-navy">{{ sale.customerName }}</p>
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {{ new Date(sale.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }} • 
                        {{ new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-10 py-8">
                  <p class="font-bold text-navy">{{ sale.unitName }}</p>
                  <p v-if="sale.snacks.length" class="text-[10px] text-gray-400 font-medium mt-1 truncate max-w-[200px]">
                    + {{ sale.snacks.map(s => s.name).join(', ') }}
                  </p>
                </td>
                <td class="px-10 py-8">
                  <span class="font-bold text-blue-600">{{ formatCurrency(sale.psIncome) }}</span>
                </td>
                <td class="px-10 py-8">
                  <span class="font-bold text-orange-600">{{ formatCurrency(sale.snackIncome) }}</span>
                </td>
                <td class="px-10 py-8 text-right">
                  <span class="text-lg font-black text-navy">{{ formatCurrency(sale.totalIncome) }}</span>
                </td>
              </tr>
              
              <tr v-if="!incomeData.bookings.length && !pending">
                <td colspan="5" class="px-10 py-32 text-center">
                  <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Icon name="heroicons:circle-stack" class="w-12 h-12 text-gray-200" />
                  </div>
                  <h4 class="text-xl font-black text-navy tracking-tight mb-2">Belum Ada Penjualan</h4>
                  <p class="text-gray-400 font-medium max-w-sm mx-auto">
                    Tidak ada data transaksi yang ditemukan untuk periode yang Anda pilih. 
                    Silakan coba pilih periode waktu yang lain.
                  </p>
                </td>
              </tr>

              <tr v-if="pending">
                 <td colspan="5" class="px-10 py-32 text-center">
                   <Icon name="svg-spinners:ring-resize" class="w-12 h-12 text-navy/20 mx-auto" />
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
