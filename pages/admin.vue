<template>
    <div class="card">
    <Tabs v-model:value="value">
        <TabList>
            <Tab value="0">Analytics</Tab>
            <Tab value="1">Users</Tab>
            <Tab value="2">Establishments</Tab>
            <Tab value="3">Food Trucks</Tab>
            <Tab value="4">Support Tickets</Tab>
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
        </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})
const value = ref('0');
</script>

<style scoped>

</style>