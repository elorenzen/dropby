<script setup>
</script>

<template>
    <div>
      <div>
        <div class="flex justify-center p-2">
            <h1 class="text-4xl">Welcome to DropBy!</h1>
        </div>
        <Account v-if="user" />
        <Auth v-else />
        <MerchantList />
    </div>
    </div>
  </template>