<template>
    <div class="flex justify-content-center flex-wrap">
        <Card style="width: 30rem; overflow: hidden">
            <template #title>
                Sign Up
            </template>
            <template #content>
                <Fluid>
                    <div class="flex-auto">
                        <FloatLabel variant="on" class="my-4">
                            <InputText id="email" v-model="email" />
                            <label for="email">Email</label>
                        </FloatLabel>
                    </div>
                    <div class="flex-auto">
                        <FloatLabel variant="on" class="my-4">
                            <Password id="password" v-model="password" />
                            <label for="password">Password</label>
                        </FloatLabel>
                    </div>
                </Fluid>
            </template>
            <template #footer>
                <Button
                    @click="addAuthUser"
                    label="Submit"
                    severity="success"
                    class="w-full"
                    :disabled="!email || !password"
                    :loading="loading"
                ></Button>
            </template>
        </Card>
    </div>

    <ErrorDialog v-if="errDialog" :errType="'User Registration'" :errMsg="errMsg" @errorClose="errDialog = false" />

    <v-snackbar
      v-model="snackbar"
      timeout="6000"
    >
      {{ snacktext }}

      <template v-slot:actions>
        <v-btn
          color="#000022"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
</template>

<script setup lang="ts">
const supabase  = useSupabaseClient()
const email     = ref()
const password  = ref()
const loading   = ref(false)
const snackbar  = ref(false)
const snacktext = ref('')
const errDialog = ref(false)
const errMsg    = ref()

const addAuthUser = async () => {
    const { error: authErr } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (!authErr) {
        await useFetch(`/api/sendRegistrationConfirmation?email=${email.value}&password=${password.value}`)
        snackbar.value = true
        snacktext.value = "New user registered! Check your email for further instructions."

        await navigateTo('/')
    } else {
        errMsg.value = authErr.message
        errDialog.value = true
    }
}
</script>