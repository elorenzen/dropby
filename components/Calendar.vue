<script setup lang="ts">
  import { ref } from '#imports'
  const loading = ref(true)
  const props = defineProps(['merchant']);
  const merchant = ref(props.merchant)
  const supabase = useSupabaseClient()
  const date = ref(new Date())

  const attrs = ref([
    {
      key: 'today',
      highlight: {
        color: 'green',
        fillMode: 'solid'
      },
      dates: new Date()
    }
  ])
</script>

<template>
  <v-row>
      <VCalendar expanded borderless v-model="date" />
  </v-row>
</template>

<style scoped>

</style>