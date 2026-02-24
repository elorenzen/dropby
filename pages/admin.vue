<template>
    <div class="card">
    <Tabs v-model:value="value">
        <TabList>
            <Tab value="0">Analytics</Tab>
            <Tab value="1">Users</Tab>
            <Tab value="2">Establishments</Tab>
            <Tab value="3">Food Trucks</Tab>
            <Tab value="4">Support Tickets</Tab>
            <Tab value="5">Beta Testers</Tab>
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
            <TabPanel value="4">Table of user-submitted support tickets</TabPanel>
            <TabPanel value="5">
                <AdminBetaTesters />
            </TabPanel>
        </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackStatus } from '~/types'

definePageMeta({
    middleware: ['auth', 'superadmin']
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