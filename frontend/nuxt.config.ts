// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],

  
  vite: {
    server: {
      allowedHosts: ["observing-unsliced-congrats.ngrok-free.dev"],
      
      // hot reload
      hmr: process.env.NODE_ENV === 'development' && !process.env.NGROK 
        ? true 
        : {
            protocol: 'wss',
            host: 'observing-unsliced-congrats.ngrok-free.dev',
            clientPort: 443
          },
          
      // Tambahkan ini untuk memastikan perubahan file terdeteksi sistem
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    // Optimasi agar tidak scan semua library
    optimizeDeps: {
      include: ['@nuxt/icon']
    }
  },
  
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true
    },
  },

  app: {
    head: {
      script: [
        {
          src: 'https://app.sandbox.midtrans.com/snap/snap.js',
          'data-client-key': 'Mid-client-nfNqzH8LPbrVtJKl'
        }
      ],
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0"
        }
      ]
    }
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:5000/api',
        changeOrigin: true,
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: '/api',
      betterAuthUrl: process.env.VITE_BETTER_AUTH_URL || 'https://observing-unsliced-congrats.ngrok-free.dev'
    }
  }
})