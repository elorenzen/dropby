<template>
  <svg v-if="name === 'arrow-right'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <path d="M5 12h14M13 6l6 6-6 6" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg v-else-if="name === 'send'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <path d="M22 2L11 13" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>
  <svg v-else-if="name === 'map'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <path d="M1 6l7-2 7 2 7-2v14l-7 2-7-2-7 2V6z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="12" cy="12" r="3" :stroke="color" stroke-width="2" fill="none"/>
  </svg>
  <svg v-else-if="name === 'user'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <circle cx="12" cy="8" r="4" :stroke="color" stroke-width="2" fill="none"/>
    <path d="M4 20c0-4 8-4 8-4s8 0 8 4" :stroke="color" stroke-width="2" fill="none"/>
  </svg>
  <svg v-else-if="name === 'plus'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <path d="M12 5v14M5 12h14" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg v-else-if="name === 'envelope'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <rect x="3" y="5" width="18" height="14" rx="2" :stroke="color" stroke-width="2" fill="none"/>
    <path d="M3 7l9 6 9-6" :stroke="color" stroke-width="2" fill="none"/>
  </svg>
  <svg v-else-if="name === 'calendar'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <rect x="3" y="4" width="18" height="18" rx="2" :stroke="color" stroke-width="2" fill="none"/>
    <path d="M16 2v4M8 2v4M3 10h18" :stroke="color" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <svg v-else-if="name === 'search'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <circle cx="11" cy="11" r="7" :stroke="color" stroke-width="2" fill="none"/>
    <line x1="16.65" y1="16.65" x2="21" y2="21" :stroke="color" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <svg v-else-if="name === 'info'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <circle cx="12" cy="12" r="10" :stroke="color" stroke-width="2" fill="none"/>
    <line x1="12" y1="8" x2="12" y2="12" :stroke="color" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="16" r="1" :fill="color"/>
  </svg>
  <svg v-else-if="name === 'globe'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <circle cx="12" cy="12" r="10" :stroke="color" stroke-width="2" fill="none"/>
    <ellipse cx="12" cy="12" rx="4" ry="10" :stroke="color" stroke-width="2" fill="none"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" :stroke="color" stroke-width="2" fill="none"/>
  </svg>
  <svg v-else-if="name === 'external-link'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <polyline points="15 3 21 3 21 9" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <line x1="10" y1="14" x2="21" y2="3" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg v-else-if="name === 'eye'" :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" :stroke="color" stroke-width="2" fill="none"/>
    <circle cx="12" cy="12" r="3" :stroke="color" stroke-width="2" fill="none"/>
  </svg>
</template>

<script setup lang="ts">
import { defineProps, defineComponent } from 'vue'
const { name, color = 'currentColor', size = 20 } = defineProps<{
  name: string,
  color?: string,
  size?: string | number
}>()
const svgStyle = { display: 'inline', verticalAlign: 'middle' }
</script>

<script lang="ts">
export default defineComponent({
  name: 'BaseIcon'
})
</script> 