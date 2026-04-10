<template>
    <div class="card p-2 sm:p-4">
    <Tabs v-model:value="value">
        <TabList class="overflow-x-auto">
            <Tab value="0">Analytics</Tab>
            <Tab value="1">Users</Tab>
            <Tab value="2">Establishments</Tab>
            <Tab value="3">Food Trucks</Tab>
            <Tab value="4">Feedback</Tab>
            <Tab value="5">Beta Testers</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">Charts and shit here</TabPanel>
            <TabPanel value="1">
                <AdminUsersTable :users="allUsers" :loading="usersLoading" />
            </TabPanel>
            <TabPanel value="2">
                <AdminMerchantsTable :merchants="allMerchants" :loading="merchantsLoading" />
            </TabPanel>
            <TabPanel value="3">
                <AdminVendorsTable :vendors="allVendors" :loading="vendorsLoading" />
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

                    <div class="feedback-filters">
                        <Select
                            v-model="filterType"
                            :options="typeFilterOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="All Types"
                            size="small"
                            class="filter-select"
                        />
                        <Select
                            v-model="filterStatus"
                            :options="statusFilterOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="All Statuses"
                            size="small"
                            class="filter-select"
                        />
                    </div>

                    <div v-if="loading" class="loading-state">
                        <i class="pi pi-spinner pi-spin" style="font-size: 2rem; color: var(--p-text-muted-color);" />
                        <p>Loading feedback...</p>
                    </div>

                    <div v-else-if="filteredFeedback.length === 0" class="empty-feedback">
                        <i class="pi pi-inbox" style="font-size: 2rem; color: var(--p-text-muted-color);" />
                        <p>No feedback submissions yet</p>
                    </div>

                    <div v-else class="feedback-list">
                        <EventBaseListCard
                            v-for="data in filteredFeedback"
                            :key="data.id"
                            :show-status-badge="true"
                        >
                            <template #vendor-avatar>
                                <div class="type-icon" :class="`type-icon--${data.type}`">
                                    <i :class="typeIcon(data.type)" />
                                </div>
                            </template>
                            <template #event-content>
                                <p class="font-semibold truncate">{{ data.title }}</p>
                                <p class="text-sm text-md-gray line-clamp-2">{{ data.description }}</p>
                                <p class="text-xs text-md-gray">
                                    {{ data.email }} · {{ formatDate(data.created_at) }}
                                    <span v-if="data.vote_count" class="vote-badge">
                                        <i class="pi pi-thumbs-up" /> {{ data.vote_count }}
                                    </span>
                                </p>
                            </template>
                            <template #status-badge>
                                <Tag :value="formatType(data.type)" :severity="typeSeverity(data.type)" />
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
                        </EventBaseListCard>
                    </div>
                </div>
            </TabPanel>
            <TabPanel value="5">
                <AdminBetaTesters />
            </TabPanel>
        </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackStatus, FeedbackType } from '~/types'
import { useToast } from '~/composables/useToast'

definePageMeta({
    middleware: ['auth', 'superadmin']
})

useSeoMeta({ title: 'Admin' })

const value = ref('0');
const { allFeedback, loading, updating, loadAllFeedback, updateFeedbackStatus } = useFeedback()
const { showToast } = useToast()
const {
    allMerchants, merchantsLoading, loadMerchants,
    allVendors, vendorsLoading, loadVendors,
    allUsers, usersLoading, loadUsers
} = useAdmin()

const filterType = ref<FeedbackType | ''>('')
const filterStatus = ref<FeedbackStatus | ''>('')

const typeFilterOptions = [
    { label: 'All Types', value: '' },
    { label: 'Bug', value: 'bug' },
    { label: 'Feature Request', value: 'feature_request' },
    { label: 'Other', value: 'other' }
]

const statusFilterOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'New', value: 'new' },
    { label: 'Viewed', value: 'viewed' },
    { label: 'Approved', value: 'approved' },
    { label: 'Working On It', value: 'working_on_it' },
    { label: 'Done', value: 'done' }
]

const filteredFeedback = computed(() => {
    return allFeedback.value.filter(f => {
        if (filterType.value && f.type !== filterType.value) return false
        if (filterStatus.value && f.status !== filterStatus.value) return false
        return true
    })
})

const statusOptions = [
    { label: 'New', value: 'new' },
    { label: 'Viewed', value: 'viewed' },
    { label: 'Approved', value: 'approved' },
    { label: 'Working On It', value: 'working_on_it' },
    { label: 'Done', value: 'done' }
]

const typeIcon = (type: string) => {
    const map: Record<string, string> = {
        bug: 'pi pi-exclamation-triangle',
        feature_request: 'pi pi-lightbulb',
        other: 'pi pi-comment'
    }
    return map[type] || 'pi pi-comment'
}

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

const tabLoaders: Record<string, () => Promise<void>> = {
    '1': loadUsers,
    '2': loadMerchants,
    '3': loadVendors,
    '4': loadFeedback
}

watch(value, async (newVal) => {
    const loader = tabLoaders[newVal]
    if (loader) {
        await loader()
    }
})
</script>

<style scoped>
.feedback-admin {
    padding: 1rem 0;
}

.feedback-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.feedback-header h3 {
    margin: 0;
}

.feedback-filters {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.filter-select {
    min-width: 160px;
}

.feedback-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.type-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.type-icon--bug {
    background-color: var(--p-red-50);
    color: var(--p-red-500);
}

.type-icon--feature_request {
    background-color: var(--p-blue-50);
    color: var(--p-blue-500);
}

.type-icon--other {
    background-color: var(--p-surface-100);
    color: var(--p-text-muted-color);
}

.p-dark .type-icon--bug {
    background-color: var(--p-red-900);
}

.p-dark .type-icon--feature_request {
    background-color: var(--p-blue-900);
}

.p-dark .type-icon--other {
    background-color: var(--p-surface-700);
}

.status-select {
    width: 100%;
    min-width: 140px;
    margin-top: 0.25rem;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.vote-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: 0.5rem;
    color: var(--p-primary-color);
    font-weight: 600;
}

.empty-feedback,
.loading-state {
    text-align: center;
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.empty-feedback p,
.loading-state p {
    color: var(--p-text-muted-color);
    margin: 0;
}

@media (max-width: 600px) {
    .feedback-filters {
        flex-direction: column;
    }

    .filter-select {
        width: 100%;
    }

    :deep(.p-tablist) {
        overflow-x: auto;
    }

    :deep(.p-tablist-content) {
        overflow-x: auto;
    }

    :deep(.p-tab) {
        white-space: nowrap;
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
    }

    .status-select {
        min-width: 120px;
    }
}
</style>
