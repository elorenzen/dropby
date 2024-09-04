<template>
  <div>
      <UContainer class="m-4">
          <AppHeader />
          <v-container>
            <slot />
          </v-container>
          <!-- <AppFooter /> -->
      </UContainer>
  </div>
</template>

<script>
export default {
  setup () {
      

      return {}
  }
}
</script>

<style lang="scss" scoped>

</style>