<template>
    <div class="border border-surface-200 bg-black dark:border-surface-700 rounded m-2  p-4">
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
        <div class="my-4 font-medium"><slot name="description" /></div>
    </div>
</template>

<script>
export default {

}
</script>

<style>

</style>