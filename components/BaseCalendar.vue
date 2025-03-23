<template>
  <div>
    <VCalendar transparent is-dark expanded :attributes="attributes" @dayclick="openDayView" :refresh="refresh" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['dayclick'])
const props = defineProps({
  attributes: {
    type: Array,
    required: true
  },
  refresh: {
    type: Number,
    required: true
  }
})

const openDayView = (day: any) => {
  emit('dayclick', day)
}

</script>

<style>

</style>