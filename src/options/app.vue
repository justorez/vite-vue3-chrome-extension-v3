<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'

const store = useAppStore()

const count = computed(() => store.count)
</script>

<template>
  <header
    aria-label="Site Header"
    class="bg-gray-50"
  >
    Options Header (Count: {{ count }})
  </header>

  <RouterView />

  <footer
    aria-label="Site Footer"
    class="bg-gray-50"
  >
    Options Footer
  </footer>
</template>

<style scoped></style>
