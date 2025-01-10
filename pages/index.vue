<template>
    <div>
        <div class="my-4 flex justify-around justify-center">
            <div class="text-6xl" style="max-width: 50%; color: #e28413;">We make event scheduling easy!</div>
        </div>
        <div class="flex justify-center p-2">
          <div style="max-width: 40%; color: #e28413; text-align: center;">
            Good drinks belong with good eats,
            and every food truck should have a spot to serve a hungry crowd.
            With <span class="font-bold">DropBy</span>, businesses can find each other and book events,
            increasing sales for both, and improving the overall experience for a shared customer base.
          </div>
        </div>

        <div class="flex items-center justify-center">
          <MerchantGallery style="max-width: 75%;" />
        </div>
        <div class="flex items-center justify-center">
          <VendorGallery style="max-width: 75%;" />
        </div>
    </div>
</template>

<script setup lang="ts">
</script>