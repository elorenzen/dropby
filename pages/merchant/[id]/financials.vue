<template>
    <div class="min-h-screen bg-background p-6">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-text-main mb-2">
              Financials
            </h1>
            <p class="text-text-muted text-lg">
              Manage and view all financials for {{ merchant?.name || 'your business' }}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <Button 
              icon="pi pi-arrow-left" 
              @click="navigateToDashboard"
              outlined 
              label="Back to Dashboard"
            />
          </div>
        </div>
      </div>

    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const merchantStore = useMerchantStore()
const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))
const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}
definePageMeta({
  middleware: ['auth']
})
</script>

<style scoped>

</style>