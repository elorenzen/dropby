<template>
  <div>
    <Card style="overflow: hidden">
        <template #content>
          <v-row>
              <v-col cols="3">
                <img :src="imageUrl" alt="Image" class="w-full rounded" />
              </v-col>
                <v-col cols="9">
                  <Fluid>
                    <div class="grid grid-cols-2 gap-4">
                        <!-- NAME -->
                        <div class="font-bold mt-4 block">
                          {{ vendor.vendor_name }}
                        </div>
                        <div class="mt-2">
                            <NuxtLink class="mx-1" :to="vendor.website" target="_blank">
                              <Button severity="secondary" icon="pi pi-link" rounded text />
                            </NuxtLink>
                            <NuxtLink class="mx-1" :to="vendor.instagram" target="_blank">
                              <Button severity="secondary" icon="pi pi-instagram" rounded text />
                            </NuxtLink>
                            <NuxtLink class="mx-1" :to="`mailto:${vendor.email}`" target="_blank">
                              <Button severity="secondary" icon="pi pi-envelope" rounded text />
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
        </template>
    </Card>
  </div>
</template>

<script setup>
const props    = defineProps(['vendor']);
const vendor   = ref(props.vendor)
const imageUrl = ref(props.vendor.avatar_url ? props.vendor.avatar_url : '')

</script>

<style lang="scss" scoped></style>
