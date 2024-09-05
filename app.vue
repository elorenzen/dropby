<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script lang="ts">
export default {
    setup() {
        // Get necessary script for Map initializtion (google maps API key required!!)
        if (process.server) {
            const runtimeConfig = useRuntimeConfig();
            useHead({ script: [{ src: `https://maps.googleapis.com/maps/api/js?key=${runtimeConfig.public.gMapKey}&v=weekly`, defer: true }] });
        }

        return {};
    },
};
</script>