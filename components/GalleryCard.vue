<template>
    <div class="gallery-card bg-surface-900 rounded m-2 p-4">
        <v-row>
            <v-col>
                <div class="flex justify-between items-center">
                    <div class="mt-0 font-semibold text-xl"><slot name="title" /></div>
                </div>

                <div class="mt-2">
                    <slot name="misc" />
                </div>
            </v-col>
            <v-col>
                <div class="relative mx-auto">
                    <slot name="image" />
                    <div class="flex justify-center mt-2">
                        <slot name="rating" />
                    </div>
                </div>
            </v-col>
        </v-row>
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