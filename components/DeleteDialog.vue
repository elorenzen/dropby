<template>
    <div>
        <Dialog visible modal :header="`Delete ${item}`" :style="{ width: '25rem' }">
            <div class="flex items-center gap-4 mb-4">
                <label>Are you sure you want to delete this {{ item }}? This action cannot be undone!</label>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="deleteCancel = false"></Button>
                <Button type="button" label="Delete" severity="danger" @click="deleteConfirm"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
const props = defineProps(['itemType'])
const item = props.itemType
const emit = defineEmits(['deleteCancel', 'deleteConfirm'])
const deleteCancel = () => emit('deleteCancel')
const deleteConfirm = () => emit('deleteConfirm')
</script>

<style scoped>

</style>