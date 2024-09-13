<script setup>
/**
 * COLOR PALETTE
 * Orange(primary): #e28413
 * Dark(secondary): #000022
 * White(accent): #fbf5f3
 */

const user = useSupabaseUser()

// const { data } = await supabase
//   .from('profiles')
//   .select(`username, website, avatar_url`)
//   .eq('id', user.value.id)
//   .single()
</script>

<template>
    <div>
      <div>
        <div class="flex justify-center p-2">
            <h3 class="text-2xl">Welcome to DropBy!</h3>
        </div>
        <v-row class="flex justify-center">
          <MapView />
        </v-row>
        <v-row class="flex justify-center">
          <MainList />
        </v-row>
    </div>
  </div>
</template>