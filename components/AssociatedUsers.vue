<template>
    <div>
        Associated Users
        <DataTable :value="associatedUsers">
            <Column field="user_name" header="Name">
                <template #body="slotProps">
                    {{ slotProps.data.first_name }} {{ slotProps.data.last_name }}
                </template>
            </Column>
            <Column field="phone" header="Phone">
                <template #body="slotProps">
                    {{ slotProps.data.phone }}
                </template>
            </Column>
            <Column field="email" header="Email">
                <template #body="slotProps">
                    {{ slotProps.data.email }}
                </template>
            </Column>
            <Column field="is_admin" header="Admin">
                <template #body="slotProps">
                    <Badge v-if="slotProps.data.is_admin"><i class="pi pi-check"></i></Badge>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
const props = defineProps(['id'])
const idParam = props.id
const store = useUserStore()
const user = store.getUser
const allUsers = store.getAllUsers

const associatedUsers = computed(() => {
    return allUsers.filter((u: any) => u[`associated_${user.type}_id`] == idParam)
})

</script>