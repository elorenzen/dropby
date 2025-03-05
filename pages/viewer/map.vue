<template>
    <!-- <div>
        <MapView />
    </div> -->
    <div class="ma-2">
        <Tabs value="0">
            <TabList>
                <Tab value="0">Locations</Tab>
                <Tab value="1">Food Trucks</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <MerchantList />
                </TabPanel>
                <TabPanel value="1">
                    <VendorList />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  alias: '/map'
})
</script>

<style scoped>

</style>