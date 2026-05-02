<template>
  <footer class="bg-navy pt-24 pb-12 overflow-hidden relative">
    <!-- Decorative Blobs -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 blur-[120px] rounded-full"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-400/5 blur-[100px] rounded-full"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <!-- Brand -->
        <div class="space-y-6">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-white/5">
              <Icon name="heroicons:bolt-20-solid" class="text-navy w-7 h-7" />
            </div>
            <span class="text-2xl font-black tracking-tighter text-white uppercase">Rent<span class="text-primary-500">PS</span></span>
          </NuxtLink>
          <p class="text-primary-100/60 font-medium leading-relaxed">
            Platform booking rental PlayStation nomor 1 di Indonesia. Main game jadi lebih mudah, cepat, dan transparan.
          </p>
          <div class="flex items-center space-x-4">
            <a href="#" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-primary-500 hover:text-navy transition-all">
              <Icon name="uil:facebook" class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-primary-500 hover:text-navy transition-all">
              <Icon name="uil:instagram" class="w-5 h-5" />
            </a>
            <a href="#" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white hover:bg-primary-500 hover:text-navy transition-all">
              <Icon name="uil:twitter" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-black uppercase tracking-widest text-sm mb-8">Eksplorasi</h4>
          <ul class="space-y-4">
            <li><NuxtLink to="/" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Beranda</NuxtLink></li>
            <li><NuxtLink to="/mitra" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Daftar Mitra</NuxtLink></li>
            <li><NuxtLink to="/promos" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Promo Menarik</NuxtLink></li>
            <li><NuxtLink to="/blog" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Artikel Game</NuxtLink></li>
          </ul>
        </div>

        <!-- Mitra -->
        <div>
          <h4 class="text-white font-black uppercase tracking-widest text-sm mb-8">Untuk Mitra</h4>
          <ul class="space-y-4">
            <li><NuxtLink to="/auth/register" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Daftar Mitra</NuxtLink></li>
            <li><NuxtLink to="/mitra/dashboard" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Dashboard Mitra</NuxtLink></li>
            <li><NuxtLink to="/help/mitra" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Pusat Bantuan</NuxtLink></li>
            <li><NuxtLink to="/terms" class="text-primary-100/60 hover:text-primary-400 font-medium transition-colors">Syarat & Ketentuan</NuxtLink></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="text-white font-black uppercase tracking-widest text-sm mb-8">Newsletter</h4>
          <p class="text-primary-100/60 font-medium mb-6">Dapatkan info promo dan update terbaru langsung di emailmu.</p>
          <div class="space-y-3">
            <input 
              type="email" 
              placeholder="Email anda..." 
              class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-primary-100/30 focus:outline-none focus:border-primary-500 transition-all font-bold"
            >
            <button class="w-full bg-primary-500 hover:bg-primary-400 text-navy font-black py-4 rounded-2xl transition-all shadow-lg shadow-primary-500/20">
              Langganan Sekarang
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-primary-100/40 text-sm font-medium">
          &copy; 2026 <span class="text-primary-100/60 font-black tracking-tight">RENT<span class="text-primary-500">PS</span></span>. All rights reserved.
        </p>
        <div class="flex items-center space-x-8">
          <NuxtLink to="/privacy" class="text-primary-100/40 hover:text-primary-400 text-xs font-bold transition-colors">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="text-primary-100/40 hover:text-primary-400 text-xs font-bold transition-colors">Terms of Service</NuxtLink>
          <NuxtLink to="/contact" class="text-primary-100/40 hover:text-primary-400 text-xs font-bold transition-colors">Contact Us</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
