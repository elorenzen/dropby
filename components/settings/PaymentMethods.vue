<template>
    <div class="space-y-6">
      <h3 class="text-xl font-semibold text-text-main">Payment Methods</h3>
      <div class="space-y-4">
        <div v-for="paymentMethod in paymentMethods" :key="paymentMethod.id" class="flex items-center justify-between p-4 border border-surface-light rounded-lg bg-surface-light">
          <div class="flex items-center space-x-3">
            <i class="pi pi-credit-card text-2xl text-accent"></i>
            <div>
              <p class="font-semibold text-text-main">{{ (paymentMethod.card.brand).charAt(0).toUpperCase() + (paymentMethod.card.brand).slice(1) }} | Exp. {{ paymentMethod.card.exp_month }}/{{ paymentMethod.card.exp_year }}</p>
              <p class="text-sm text-text-muted">**** **** **** {{ paymentMethod.card.last4 }}</p>
            </div>
          </div>
          <Button icon="pi pi-trash" class="p-button-text text-text-muted" />
        </div>

        <Button 
          icon="pi pi-plus" 
          label="Add Payment Method" 
          class="w-full p-button-outlined border-surface text-text-muted"
          @click="showAddDialog = true"
        />
      </div>

      <!-- Add Payment Method Dialog -->
      <Dialog
        :visible="showAddDialog"
        @update:visible="showAddDialog = $event"
        modal
        header="Add Payment Method"
        :style="{ width: '90vw', maxWidth: '600px' }"
        :closable="true"
        :dismissable-mask="true"
      >
        <SettingsAddPaymentMethod 
          :stripeCustomerId="stripeCustomerId"
          @cancel="showAddDialog = false"
          @success="handlePaymentMethodAdded"
          @failed="handlePaymentMethodFailed"
        />
      </Dialog>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
    stripeCustomerId: string | null,
}>()

const toast = useToast()
const paymentMethods = ref<any[]>([])
const showAddDialog = ref(false)

onMounted(async () => {
    if (!props.stripeCustomerId) return
    
    const response = await $fetch('/api/payments/list-payment-methods', {
        method: 'POST',
        body: {
            customerId: props.stripeCustomerId
        }
    })
    paymentMethods.value = response
    console.log('paymentMethods', paymentMethods.value)
})

const handlePaymentMethodAdded = async () => {
    showAddDialog.value = false
    
    // Refresh payment methods list
    if (props.stripeCustomerId) {
        const response = await $fetch('/api/payments/list-payment-methods', {
            method: 'POST',
            body: {
                customerId: props.stripeCustomerId
            }
        })
        paymentMethods.value = response
    }
}

const handlePaymentMethodFailed = () => {
    showAddDialog.value = false
}
</script>