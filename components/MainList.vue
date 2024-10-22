<template>
  <div class="card">
    <Tabs v-model:value="value">
        <TabList>
            <Tab value="0">Establishments</Tab>
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

<script setup>
const value = ref('0');
</script>

<style lang="scss" scoped>

</style>