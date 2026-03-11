<template>
  <DataTable
    :value="vendors"
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
        <span class="text-xl font-bold">Food Trucks</span>
        <span class="text-sm" style="color: var(--p-text-muted-color);">{{ vendors.length }} total</span>
      </div>
    </template>
    <Column field="vendor_name" header="Name" sortable>
      <template #body="{ data }">
        <span class="font-semibold">{{ data.vendor_name || '-' }}</span>
      </template>
    </Column>
    <Column field="email" header="Email" sortable>
      <template #body="{ data }">
        {{ data.email || '-' }}
      </template>
    </Column>
    <Column field="phone" header="Phone">
      <template #body="{ data }">
        {{ data.phone || '-' }}
      </template>
    </Column>
    <Column field="cuisine" header="Cuisine">
      <template #body="{ data }">
        <div v-if="data.cuisine && data.cuisine.length" class="flex flex-wrap gap-1">
          <Tag v-for="(c, idx) in data.cuisine" :key="idx" :value="c" severity="info" />
        </div>
        <span v-else style="color: var(--p-text-muted-color);">-</span>
      </template>
    </Column>
    <Column field="compliance_verified" header="Compliance" sortable>
      <template #body="{ data }">
        <Tag v-if="data.compliance_verified" severity="success" value="Verified" />
        <Tag v-else severity="warn" value="Unverified" />
      </template>
    </Column>
    <Column field="average_merchant_rating" header="Rating" sortable>
      <template #body="{ data }">
        <span v-if="data.average_merchant_rating">{{ data.average_merchant_rating.toFixed(1) }} / 5</span>
        <span v-else style="color: var(--p-text-muted-color);">-</span>
      </template>
    </Column>
    <Column field="created_at" header="Created" sortable>
      <template #body="{ data }">
        {{ formatDate(data.created_at) }}
      </template>
    </Column>
    <Column header="Links" style="width: 8rem">
      <template #body="{ data }">
        <div class="flex gap-1">
          <Button
            v-if="data.website"
            as="a"
            size="small"
            icon="pi pi-globe"
            variant="text"
            :href="data.website"
            rounded
            target="_blank"
          />
          <Button
            v-if="data.instagram"
            as="a"
            size="small"
            icon="pi pi-instagram"
            variant="text"
            :href="data.instagram"
            rounded
            target="_blank"
          />
        </div>
      </template>
    </Column>
    <template #empty>
      <div class="text-center p-4" style="color: var(--p-text-muted-color);">No vendors found.</div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import type { Vendor } from '~/types'

defineProps<{
  vendors: Vendor[]
  loading: boolean
}>()

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
