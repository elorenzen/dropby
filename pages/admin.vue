<template>
    <div class="card">
    <Tabs v-model:value="value">
        <TabList>
            <Tab value="0">Analytics</Tab>
            <Tab value="1">Users</Tab>
            <Tab value="2">Establishments</Tab>
            <Tab value="3">Food Trucks</Tab>
            <Tab value="4">Feedback</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">Charts and shit here</TabPanel>
            <TabPanel value="1">
                <h4>Table of associated admin users</h4>
                <p><strong>to-do</strong></p>
                <p>add 'switch' fields to set platform feature access based on new user roles(dev/customer support/etc.)</p>
            </TabPanel>
            <TabPanel value="2">
                <p><strong>to-do</strong></p>
                <p>table column additions: billing info, activity, usage metrics</p>
                <p>table actions: 'ban'/hide merchants/vendors, activate 'promoted' status</p>
                <MerchantList />
            </TabPanel>
            <TabPanel value="3">
                <p><strong>to-do</strong></p>
                <p>table column additions: billing info, activity, usage metrics</p>
                <p>table actions: 'ban'/hide merchants/vendors, activate 'promoted' status</p>
                <VendorList />
            </TabPanel>
            <TabPanel value="4">
                <div class="feedback-admin">
                    <div class="feedback-header">
                        <h3>User Feedback</h3>
                        <Button
                            icon="pi pi-refresh"
                            label="Refresh"
                            outlined
                            size="small"
                            @click="loadFeedback"
                            :loading="loading"
                        />
                    </div>

                    <DataTable
                        :value="allFeedback"
                        :loading="loading"
                        stripedRows
                        paginator
                        :rows="15"
                        :rowsPerPageOptions="[10, 15, 25, 50]"
                        sortField="created_at"
                        :sortOrder="-1"
                        tableStyle="min-width: 50rem"
                    >
                        <Column field="type" header="Type" sortable style="width: 10%">
                            <template #body="{ data }">
                                <Tag :value="formatType(data.type)" :severity="typeSeverity(data.type)" />
                            </template>
                        </Column>
                        <Column field="title" header="Title" sortable style="width: 20%" />
                        <Column field="description" header="Description" style="width: 30%">
                            <template #body="{ data }">
                                <span class="description-cell">{{ data.description }}</span>
                            </template>
                        </Column>
                        <Column field="email" header="Email" sortable style="width: 15%" />
                        <Column field="status" header="Status" sortable style="width: 12%">
                            <template #body="{ data }">
                                <Select
                                    :modelValue="data.status"
                                    @update:modelValue="(val: string) => handleStatusChange(data.id, val)"
                                    :options="statusOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    :loading="updating"
                                    size="small"
                                    class="status-select"
                                />
                            </template>
                        </Column>
                        <Column field="created_at" header="Created" sortable style="width: 13%">
                            <template #body="{ data }">
                                {{ formatDate(data.created_at) }}
                            </template>
                        </Column>
                        <template #empty>
                            <div class="empty-feedback">
                                <i class="pi pi-inbox" style="font-size: 2rem; color: var(--p-text-muted-color);" />
                                <p>No feedback submissions yet</p>
                            </div>
                        </template>
                    </DataTable>
                </div>
            </TabPanel>
        </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackStatus } from '~/types'

definePageMeta({
    middleware: ['auth']
})

useSeoMeta({ title: 'Admin' })

const value = ref('0');
const { allFeedback, loading, updating, loadAllFeedback, updateFeedbackStatus } = useFeedback()
const { showToast } = useToast()

const statusOptions = [
    { label: 'New', value: 'new' },
    { label: 'Viewed', value: 'viewed' },
    { label: 'Approved', value: 'approved' },
    { label: 'Working On It', value: 'working_on_it' },
    { label: 'Done', value: 'done' }
]

const formatType = (type: string) => {
    const map: Record<string, string> = {
        bug: 'Bug',
        feature_request: 'Feature Request',
        other: 'Other'
    }
    return map[type] || type
}

const typeSeverity = (type: string) => {
    const map: Record<string, string> = {
        bug: 'danger',
        feature_request: 'info',
        other: 'secondary'
    }
    return map[type] || 'secondary'
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

const handleStatusChange = async (id: string, newStatus: string) => {
    try {
        await updateFeedbackStatus(id, newStatus as FeedbackStatus)
        showToast('Feedback status updated', 'success')
    } catch (error: any) {
        showToast(error.statusMessage || 'Failed to update status', 'error')
    }
}

const loadFeedback = async () => {
    try {
        await loadAllFeedback()
    } catch (error: any) {
        showToast(error.statusMessage || 'Failed to load feedback', 'error')
    }
}

// Load feedback when tab 4 is selected
watch(value, async (newVal) => {
    if (newVal === '4' && allFeedback.value.length === 0) {
        await loadFeedback()
    }
})
</script>

<style scoped>
.feedback-admin {
    padding: 1rem 0;
}

.feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.feedback-header h3 {
    margin: 0;
}

.description-cell {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 0.875rem;
}

.status-select {
    width: 100%;
}

.empty-feedback {
    text-align: center;
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.empty-feedback p {
    color: var(--p-text-muted-color);
    margin: 0;
}
</style>