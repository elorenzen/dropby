<template>
    <div>
        <GetStarted :businessType="businessType" :plan="plan" />
    </div>
</template>

<script setup lang="ts">
// Set page title
useSeoMeta({ title: 'Get Started' })
const route = useRoute()
const businessType = route.query.businessType as 'merchant' | 'vendor'
const plan = route.query.plan as string
</script>

<style scoped>

</style>