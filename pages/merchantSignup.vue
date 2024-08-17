<script setup>
const user = useSupabaseUser()
</script>

<template>
  <div class="flex justify-center p-2">
      <h1 class="text-4xl">New Merchant</h1>
  </div>
  <div class="container">
    <NewMerchant />
  </div>
</template>