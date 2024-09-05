<script setup>
const user = useSupabaseUser()
</script>

<template>
  <div class="flex justify-center p-2">
      <h2 class="text-4xl">New Merchant User</h2>
  </div>
  <div class="container">
    <NewMerchantUser />
  </div>
</template>