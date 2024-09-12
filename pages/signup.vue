<script setup>
const user = useSupabaseUser()
</script>

<template>
    <v-row class="flex justify-center p-2">
        <h2 class="text-4xl">Sign Up as...</h2>
    </v-row>
    <v-row class="flex justify-center p-2">
        <v-btn
            class="mx-1"
            color="#e28413"
            variant="outlined">
            <NuxtLink to="/merchantSignup">
                Merchant
            </NuxtLink>
        </v-btn>
        <v-btn
            class="mx-1"
            color="#e28413"
            variant="outlined">
            <NuxtLink to="/vendorSignup">
                Vendor
            </NuxtLink>
        </v-btn>
    </v-row>
</template>