<template>
  <DataTable
    :value="users"
    :loading="loading"
    paginator
    :rows="20"
    :rowsPerPageOptions="[10, 20, 50]"
    sortField="created_at"
    :sortOrder="-1"
    stripedRows
    scrollable
    responsiveLayout="scroll"
    dataKey="id"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xl font-bold">Users</span>
        <span class="text-sm" style="color: var(--p-text-muted-color);">{{ users.length }} total</span>
      </div>
    </template>
    <Column field="first_name" header="Name" sortable>
      <template #body="{ data }">
        <span class="font-semibold">
          {{ data.first_name || '' }} {{ data.last_name || '' }}
          <span v-if="!data.first_name && !data.last_name" style="color: var(--p-text-muted-color);">-</span>
        </span>
      </template>
    </Column>
    <Column field="email" header="Email" sortable>
      <template #body="{ data }">
        {{ data.email || '-' }}
      </template>
    </Column>
    <Column field="type" header="Type" sortable>
      <template #body="{ data }">
        <Tag v-if="data.type" :value="capitalizeType(data.type)" :severity="typeSeverity(data.type)" />
        <span v-else style="color: var(--p-text-muted-color);">-</span>
      </template>
    </Column>
    <Column field="current_plan" header="Plan" sortable>
      <template #body="{ data }">
        <div class="flex flex-wrap gap-1 items-center">
          <Tag :value="(data.current_plan || 'free').toUpperCase()" :severity="planSeverity(data.current_plan)" />
          <Tag v-if="data.is_beta_tester" severity="info" value="BETA" />
        </div>
      </template>
    </Column>
    <Column field="is_admin" header="Admin" sortable>
      <template #body="{ data }">
        <div class="flex flex-wrap gap-1">
          <Tag v-if="data.is_superadmin" severity="danger" value="Superadmin" />
          <Tag v-else-if="data.is_admin" severity="warn" value="Admin" />
          <span v-else style="color: var(--p-text-muted-color);">-</span>
        </div>
      </template>
    </Column>
    <Column field="registered" header="Status" sortable>
      <template #body="{ data }">
        <Tag v-if="data.registered" severity="success" value="Active" />
        <Tag v-else severity="secondary" value="Invited" />
      </template>
    </Column>
    <Column field="available_to_contact" header="Contactable" sortable>
      <template #body="{ data }">
        <i v-if="data.available_to_contact" class="pi pi-check-circle" style="color: var(--p-green-500);" />
        <i v-else class="pi pi-times-circle" style="color: var(--p-text-muted-color);" />
      </template>
    </Column>
    <Column field="created_at" header="Created" sortable>
      <template #body="{ data }">
        {{ formatDate(data.created_at) }}
      </template>
    </Column>
    <template #empty>
      <div class="text-center p-4" style="color: var(--p-text-muted-color);">No users found.</div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import type { User } from '~/types'

defineProps<{
  users: User[]
  loading: boolean
}>()

const capitalizeType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const typeSeverity = (type: string) => {
  const map: Record<string, string> = {
    merchant: 'info',
    vendor: 'success'
  }
  return map[type] || 'secondary'
}

const planSeverity = (plan: string) => {
  const map: Record<string, string> = {
    free: 'secondary',
    pro: 'info',
    premium: 'warn'
  }
  return map[plan] || 'secondary'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(.p-datatable) {
    font-size: 0.875rem;
  }
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
  }
}
</style>
