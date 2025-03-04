<template>
    <div>
        <Dialog
            visible
            modal
            :header="`${errorType} Error`"
            :style="{ width: '25rem' }"
        >
            <div class="flex items-center gap-4 mb-4">
                <label>{{ errorMessage }}.</label>
            </div>
            <div class="flex justify-end gap-2">
                <Button class="w-full" type="button" label="OK" severity="secondary" @click="close"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
const props = defineProps(['errType', 'errMsg'])
const errorType = props.errType
const errorMessage = props.errMsg
const emit = defineEmits(['errorClose'])
const close = () => emit('errorClose')
</script>

<style scoped>

</style>