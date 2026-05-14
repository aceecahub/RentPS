import { createAuthClient } from "better-auth/vue"

export default defineNuxtPlugin(() => {
  console.log('Better Auth plugin initializing...')
  const config = useRuntimeConfig()
  console.log('Better Auth URL:', config.public.betterAuthUrl)
  
  const authClient = createAuthClient({
    baseURL: config.public.betterAuthUrl + "/api/auth",
    fetchOptions: {
      headers: import.meta.server ? useRequestHeaders(['cookie', 'authorization']) : undefined
    }
  })

  return {
    provide: {
      authClient
    }
  }
})
