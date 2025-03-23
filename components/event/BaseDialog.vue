<template>
    <Card style="overflow: hidden">
        <template #content>
            <slot name="content"></slot>
          <!-- <Fluid>
              <div class="col-span-full">
                <FloatLabel variant="on" class="my-4">
                  <DatePicker id="new-event-start" v-model="newEventStart" timeOnly fluid hourFormat="12" />
                  <label for="new-event-start" class="block mb-2"> Start Time</label>
                </FloatLabel>
              </div>
              <div class="col-span-full">
                <FloatLabel variant="on" class="my-4">
                  <label for="new-event-end" class="block mb-2"> End Time</label>
                  <DatePicker id="new-event-end" v-model="newEventEnd" timeOnly fluid hourFormat="12" />
                </FloatLabel>
              </div>
              <div class="col-span-full">
                  <FloatLabel variant="on" class="my-4">
                      <Textarea id="notes" v-model="notes" rows="3" />
                      <label for="notes">Notes for Vendor</label>
                  </FloatLabel>
              </div>
          </Fluid> -->
        </template>
        <template #footer>
            <slot name="footer"></slot>
            <!-- <div class="flex gap-4 mt-1">
                <Button
                  @click="addEvent"
                  :disabled="
                    !newEventStart ||
                    !newEventEnd ||
                    new Date(newEventStart.value).getTime() < new Date().getTime()
                  "
                  label="Add Event"
                  class="w-full"
                  :loading="loading"
                ></Button>
            </div> -->
        </template>
    </Card>
</template>

<script setup lang="ts">

</script>

<style>

</style>