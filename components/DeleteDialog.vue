<template>
    <Dialog 
        :visible="visible" 
        modal 
        :header="`Delete ${itemType}`" 
        :style="{ width: '28rem' }"
        class="delete-dialog"
        :closable="true"
        :closeOnEscape="true"
    >
        <div class="flex items-start gap-4 mb-6">
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900 flex-shrink-0">
                <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-text-main mb-2">Are you sure?</h3>
                <p class="text-text-muted leading-relaxed">
                    You're about to delete this {{ itemType.toLowerCase() }}. This action cannot be undone and will permanently remove the {{ itemType.toLowerCase() }} from the system.
                </p>
            </div>
        </div>
        
        <div class="flex justify-end gap-3">
            <Button 
                type="button" 
                label="Cancel" 
                severity="secondary" 
                outlined
                @click="deleteCancel"
                class="min-w-[80px]"
            />
            <Button 
                type="button" 
                label="Delete" 
                severity="danger" 
                @click="deleteConfirm"
                class="min-w-[80px]"
            />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
interface Props {
    visible: boolean
    itemType: string
}

const props = defineProps<Props>()
const emit = defineEmits(['deleteCancel', 'deleteConfirm'])

const deleteCancel = () => emit('deleteCancel')
const deleteConfirm = () => emit('deleteConfirm')
</script>

<style scoped>
/* Delete Dialog Styles */
:deep(.delete-dialog .p-dialog-header) {
    border-bottom: 1px solid rgb(229 231 235);
    padding: 1.5rem 1.5rem 1rem 1.5rem;
}

:deep(.delete-dialog .p-dialog-content) {
    padding: 0 1.5rem 1.5rem 1.5rem;
}

:deep(.delete-dialog .p-dialog-footer) {
    border-top: 1px solid rgb(229 231 235);
    padding: 1rem 1.5rem;
}

:deep(.delete-dialog .p-dialog-title) {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(239 68 68);
}
</style>