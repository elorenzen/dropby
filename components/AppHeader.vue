<script setup lang="ts">
const route = useRoute()

const links = [
  [{
    label: 'New Merchant',
    icon: 'i-heroicons-user',
    to: '/merchantSignup'
  }]
]
</script>

<template>
  <UHorizontalNavigation :links="links" class="border-b border-gray-200 dark:border-gray-800" />
</template>

