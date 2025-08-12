<template>
  <div>
    <Card style="overflow: hidden">
        <template #content>
          <v-row>
              <v-col cols="3">
                <NuxtImg :src="imageUrl" alt="Image" class="w-full rounded" />
              </v-col>
                <v-col cols="9">
                  <Fluid>
                    <div class="grid grid-cols-2 gap-4">
                        <!-- NAME -->
                        <div class="font-bold mt-4 block">
                          {{ vendor.vendor_name }}
                        </div>
                        <div class="mt-2">
                          <Badge class="mx-1" v-for="(i, index) in vendor.cuisine" :key="`${i}-${index}`">{{ i }}</Badge>
                        </div>
                        <div>
                            <NuxtLink class="mr-1" :to="vendor.website" target="_blank">
                              <Button icon="pi pi-link" rounded text />
                            </NuxtLink>
                            <NuxtLink class="mx-1" :to="vendor.instagram" target="_blank">
                              <Button icon="pi pi-instagram" rounded text />
                            </NuxtLink>
                            <NuxtLink class="mx-1" :to="`mailto:${vendor.email}`" target="_blank">
                              <Button icon="pi pi-envelope" rounded text />
                            </NuxtLink>
                        </div>

                        <!-- DESCRIPTION -->
                        <div class="col-span-full">
                          {{ vendor.vendor_description }}
                        </div>
                    </div>
                  </Fluid>
                </v-col>
            </v-row> 

            <Divider />

            <div>
              <Tabs value="0">
                  <TabList>
                      <Tab v-for="tab in categorizedMenu" :key="tab.title" :value="tab.value">{{ tab.title }}</Tab>
                  </TabList>
                  <TabPanels>
                      <TabPanel v-for="tab in categorizedMenu" :key="tab.content" :value="tab.value">
                        <DataTable resizableColumns columnResizeMode="expand" :value="tab.items">
                            <Column header="">
                              <template #body="slotProps">
                                <NuxtImg :src="slotProps.data.image_url" alt="No image" class="w-24 rounded" />
                              </template>
                            </Column>
                            <Column field="name" header="Name"></Column>
                            <Column field="description" header="Description"></Column>
                            <Column field="price" header="Price ($)"></Column>
                        </DataTable>
                      </TabPanel>
                  </TabPanels>
              </Tabs>
            </div>
        </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
const props    = defineProps(['id']);
const idParam = ref(props.id)
const menuStore = useMenuStore()
await menuStore.loadMenuItems(idParam.value)
const menuItems = menuStore.getMenuItems

const vendorStore = useVendorStore()
const vendor = ref(await vendorStore.getVendorById(idParam.value))
const imageUrl = ref(vendor.value.avatar_url ? vendor.value.avatar_url : '')

const categorizedMenu = computed(() => {
  const menu = menuItems
  const uniqCategories = [...new Set(menu.map(item => item.type))]

  let categorizedMenu = []
  uniqCategories.forEach((cat, index) => {
    const arr = menu.filter(i=> i.type === cat)
    categorizedMenu.push({
      title: cat,
      items: arr,
      value: `${index}`
    })
  })

  return categorizedMenu
})
</script>

<style lang="scss" scoped></style>
