<template>
    <div class="gallery-card bg-surface-900 rounded m-2 p-4">
        <div class="flex flex-row flex-wrap gap-2">
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                    <div class="mt-0 font-semibold text-xl"><slot name="title" /></div>
                </div>

                <div class="mt-2">
                    <slot name="misc" />
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="relative mx-auto">
                    <slot name="image" />
                    <div class="flex justify-center mt-2">
                        <slot name="rating" />
                    </div>
                </div>
            </div>
        </div>
        <div class="my-4 font-medium">
            <ScrollPanel style="height: 12vh;">
                <slot name="description" />
            </ScrollPanel>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style>
.gallery-card {
    height: 100%;
}
</style>