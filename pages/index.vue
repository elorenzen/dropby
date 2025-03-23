<template>
    <div>
        <div class="m-4 text-surface-700 dark:text-surface-100 text-center flex flex-col items-center gap-4">
            <div class=" font-bold text-4xl leading-tight">Event Scheduling Made Easy!</div>
            <div class=" text-xl leading-normal" style="width: 50%;">
              Good drinks belong with good eats,
              and every food truck should have a spot to serve a hungry crowd.
              With <span class="font-bold" style="color: #FF8906;">DropBy</span>, businesses can find each other and book events,
              increasing sales for both, and improving the overall experience for a shared customer base.
            </div>
        </div>

        <div class="flex items-center justify-center">
          <HomeGalleries />
        </div>
        <NuxtLink to="/search">Food Search</NuxtLink>
    </div>
</template>

<script setup lang="ts">
</script>