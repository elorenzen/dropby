<script setup>
const user = useSupabaseUser()
</script>

<template>
  <div class="flex justify-center p-2">
      <h2 class="text-4xl">New Merchant</h2>
  </div>
  <NewMerchant />
</template>