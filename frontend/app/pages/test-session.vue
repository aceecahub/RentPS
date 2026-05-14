<script setup>
const { $authClient } = useNuxtApp()
const session = $authClient.useSession()
</script>

<template>
  <div class="p-10">
    <h1 class="text-2xl font-bold">Session Debug</h1>
    <div v-if="session.isPending">Loading...</div>
    <div v-else>
      <pre class="bg-gray-100 p-4 mt-4 rounded">{{ JSON.stringify(session.data, null, 2) }}</pre>
      <pre class="bg-red-100 p-4 mt-4 rounded">Error: {{ JSON.stringify(session.error, null, 2) }}</pre>
    </div>
    <button @click="$authClient.signIn.social({ provider: 'google', callbackURL: '/test-session' })" class="mt-4 p-2 bg-blue-500 text-white rounded">Login Google Again</button>
  </div>
</template>
