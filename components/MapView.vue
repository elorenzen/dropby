<template>
  <div class="flex items-center justify-center p-5">
    <ScriptGoogleMaps
      ref="maps"
      :center="center"
      :markers="markers"
      :api-key="config.public.gMapKey"
      class="group"
      above-the-fold
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const maps = ref()

const config = useRuntimeConfig()

const center = ref()
const userStore = useUserStore()
const merchantStore = useMerchantStore()
const merchants = merchantStore.getAllMerchants

const markers = ref([])


onMounted(() => {
  center.value = userStore.getUserLocation
  if (merchants.length > 0) setMerchantMarkers()
})

const setMerchantMarkers = () => {
  merchants.forEach(merchant => {
    const coords = JSON.parse(merchant.coordinates)
    const marker = { id: merchant.id, position: coords }
    markers.value.push(marker)
  })
}
</script>