<template>
    <span>Merchant ID: {{ $route.params.id }}</span>
  </template>
  
  <script setup>
  const route = useRoute()
  console.log(route.params) // { id: '123' }
  </script>

<style lang="scss" scoped>

</style>