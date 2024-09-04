<script setup>
const user = useSupabaseUser()
</script>

<template>
  <div class="flex justify-center p-2">
      <h1 class="text-4xl">Sign Up as...</h1>
      <v-row>
    <v-btn
        class="mx-1"
        color="black"
        variant="outlined">
        Merchant
      </v-btn>
  </v-row>
  <v-row>
    <v-btn
        class="mx-1"
        color="black"
        variant="outlined">
        Vendor
      </v-btn>
  </v-row>
  </div>
</template>