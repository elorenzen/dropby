<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-text-main flex items-center gap-3">
        <i class="pi pi-credit-card text-blue-600"></i>
        Payment History
      </h2>
      <div class="flex items-center gap-3">
        <Calendar 
          v-model="dateRange" 
          selectionMode="range" 
          :showIcon="true"
          placeholder="Select date range"
          class="w-48"
        />
        <Button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          outlined
          size="small"
          @click="exportPayments"
        />
      </div>
    </div>

    <!-- Payment Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Spent</p>
            <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">
              ${{ formatCurrency(totalSpent) }}
            </p>
          </div>
          <i class="pi pi-dollar text-blue-500 text-xl"></i>
        </div>
      </div>

      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-600 dark:text-green-400 font-medium">Event Payments</p>
            <p class="text-2xl font-bold text-green-800 dark:text-green-200">
              ${{ formatCurrency(totalEventPayments) }}
            </p>
          </div>
          <i class="pi pi-calendar text-green-500 text-xl"></i>
        </div>
      </div>

      <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-orange-600 dark:text-orange-400 font-medium">Subscription Fees</p>
            <p class="text-2xl font-bold text-orange-800 dark:text-orange-200">
              ${{ formatCurrency(totalSubscriptionFees) }}
            </p>
          </div>
          <i class="pi pi-star text-orange-500 text-xl"></i>
        </div>
      </div>

      <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Platform Fees</p>
            <p class="text-2xl font-bold text-purple-800 dark:text-purple-200">
              ${{ formatCurrency(totalPlatformFees) }}
            </p>
          </div>
          <i class="pi pi-percentage text-purple-500 text-xl"></i>
        </div>
      </div>
    </div>

    <!-- Payment History Table -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-text-main">Recent Payments</h3>
        <div class="flex items-center gap-2">
          <InputText 
            v-model="searchQuery" 
            placeholder="Search payments..."
            class="w-48"
          />
          <Dropdown
            v-model="selectedCategory"
            :options="paymentCategories"
            optionLabel="label"
            optionValue="value"
            placeholder="All Categories"
            class="w-40"
          />
        </div>
      </div>

      <DataTable 
        :value="filteredPayments" 
        :loading="loading"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} payments"
        class="w-full"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        emptyMessage="No payments found. Payments will appear here once you start creating events or subscribing to plans."
      >
        <Column field="date" header="Date" sortable>
          <template #body="{ data }">
            <span class="font-medium">{{ formatDate(data.date) }}</span>
          </template>
        </Column>

        <Column field="type" header="Type" sortable>
          <template #body="{ data }">
            <Tag 
              :value="getPaymentTypeLabel(data.type)" 
              :severity="getPaymentTypeSeverity(data.type)"
            />
          </template>
        </Column>

        <Column field="description" header="Description" sortable>
          <template #body="{ data }">
            <div>
              <p class="font-medium">{{ data.description }}</p>
              <p v-if="data.details" class="text-sm text-text-muted">{{ data.details }}</p>
            </div>
          </template>
        </Column>

        <Column field="recipient" header="Recipient" sortable>
          <template #body="{ data }">
            <span v-if="data.recipient_name" class="font-medium">{{ data.recipient_name }}</span>
            <span v-else class="text-text-muted">—</span>
          </template>
        </Column>

        <Column field="amount" header="Amount" sortable>
          <template #body="{ data }">
            <span class="font-bold text-red-600">-${{ formatCurrency(data.amount) }}</span>
          </template>
        </Column>

        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <Tag 
              :value="data.status" 
              :severity="getStatusSeverity(data.status)"
            />
          </template>
        </Column>

        <Column field="actions" header="Actions">
          <template #body="{ data }">
            <Button
              icon="pi pi-eye"
              size="small"
              outlined
              @click="viewPaymentDetails(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Payment Details Modal -->
          <Dialog
        v-model="showPaymentModal"
        modal
        header="Payment Details"
        :style="{ width: '90vw', maxWidth: '600px' }"
        :closable="true"
        :dismissable-mask="true"
      >
      <div v-if="selectedPayment" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">Payment Date</label>
            <p class="text-text-main">{{ formatDate(selectedPayment.date) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-muted mb-1">Amount</label>
            <p class="text-xl font-bold text-red-600">-${{ formatCurrency(selectedPayment.amount) }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-text-muted mb-1">Type</label>
          <Tag 
            :value="getPaymentTypeLabel(selectedPayment.type)" 
            :severity="getPaymentTypeSeverity(selectedPayment.type)"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-text-muted mb-1">Description</label>
          <p class="text-text-main">{{ selectedPayment.description }}</p>
        </div>

        <div v-if="selectedPayment.details">
          <label class="block text-sm font-medium text-text-muted mb-1">Details</label>
          <p class="text-text-main">{{ selectedPayment.details }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-text-muted mb-1">Status</label>
          <Tag 
            :value="selectedPayment.status" 
            :severity="getStatusSeverity(selectedPayment.status)"
          />
        </div>

        <div v-if="selectedPayment.reference">
          <label class="block text-sm font-medium text-text-muted mb-1">Reference</label>
          <p class="text-text-main font-mono text-sm">{{ selectedPayment.reference }}</p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
interface Props {
  merchantId: string
}

const props = defineProps<Props>()

// Types
interface Payment {
  id: string
  date: string
  type: string
  description: string
  details?: string
  recipient_name: string
  amount: number
  status: string
  reference: string
}

// State
const loading = ref(false)
const payments = ref<Payment[]>([])
const dateRange = ref<[Date, Date] | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('all')
const showPaymentModal = ref(false)
const selectedPayment = ref<Payment | null>(null)

// Payment categories for filtering
const paymentCategories = [
  { label: 'All Categories', value: 'all' },
  { label: 'Event Payments', value: 'event' },
  { label: 'Subscription Fees', value: 'subscription' },
  { label: 'Platform Fees', value: 'platform' }
]

// Computed properties
const filteredPayments = computed(() => {
  let filtered = payments.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter((payment: Payment) => 
      payment.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.details?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((payment: Payment) => payment.type === selectedCategory.value)
  }

  // Filter by date range
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    filtered = filtered.filter((payment: Payment) => {
      const paymentDate = new Date(payment.date)
      return paymentDate >= dateRange.value![0] && paymentDate <= dateRange.value![1]
    })
  }

  return filtered
})

const totalSpent = computed(() => {
  return payments.value.reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const totalEventPayments = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.type === 'event')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const totalSubscriptionFees = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.type === 'subscription')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const totalPlatformFees = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.type === 'platform')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

// Methods
const loadPayments = async () => {
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    
    console.log('Loading payments for merchant:', props.merchantId)
    
    // Load payments from the payments table - start with simple query
    let { data: paymentsData, error } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', props.merchantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error with simple query:', error)
      // Try alternative field name
      const { data: altData, error: altError } = await supabase
        .from('payments')
        .select('*')
        .eq('payer_id', props.merchantId)
        .order('created_at', { ascending: false })
      
      if (altError) {
        console.error('Error with alternative query:', altError)
        throw altError
      }
      paymentsData = altData
    }

    // Now load related data separately to avoid relationship conflicts
    if (paymentsData && paymentsData.length > 0) {
      const eventIds = paymentsData.filter((p: any) => p.event_id).map((p: any) => p.event_id)
      const vendorIds = paymentsData.filter((p: any) => p.vendor_id).map((p: any) => p.vendor_id)
      
      let eventsData: any = {}
      let vendorsData: any = {}
      
      if (eventIds.length > 0) {
        const { data: events } = await supabase
          .from('events')
          .select('id, event_name, event_date, vendor_id')
          .in('id', eventIds)
        eventsData = events?.reduce((acc: any, event: any) => {
          acc[event.id] = event
          return acc
        }, {}) || {}
      }
      
      if (vendorIds.length > 0) {
        const { data: vendors } = await supabase
          .from('vendors')
          .select('id, vendor_name')
          .in('id', vendorIds)
        vendorsData = vendors?.reduce((acc: any, vendor: any) => {
          acc[vendor.id] = vendor
          return acc
        }, {}) || {}
      }
      
      // Attach related data to payments
      paymentsData = paymentsData.map((payment: any) => ({
        ...payment,
        events: eventsData[payment.event_id],
        vendors: vendorsData[payment.vendor_id]
      }))
    }

    if (error && !paymentsData) throw error

    console.log('Payments data loaded:', paymentsData)

    // Transform the data for display
    payments.value = (paymentsData || []).map((payment: any) => ({
      id: payment.id,
      date: payment.created_at,
      type: getPaymentType(payment),
      description: getPaymentDescription(payment),
      details: getPaymentDetails(payment),
      recipient_name: getRecipientName(payment),
      amount: payment.amount + (payment.platform_fee || 0) + (payment.processing_fee || 0), // Total amount merchant pays
      status: payment.status,
      reference: payment.stripe_payment_intent_id || payment.id
    }))

    // Also load subscription fees
    await loadSubscriptionFees()
    
    console.log('Final payments array:', payments.value)
    
  } catch (error) {
    console.error('Error loading payments:', error)
  } finally {
    loading.value = false
  }
}

const loadSubscriptionFees = async () => {
  try {
    const supabase = useSupabaseClient()
    
    // Load subscription data to calculate fees
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', props.merchantId)
      .eq('business_type', 'merchant')
      .order('created_at', { ascending: false })

    if (subscriptions && subscriptions.length > 0) {
      // Add subscription fees to payments
      const subscriptionPayments = subscriptions.map((sub: any) => ({
        id: `sub_${sub.id}`,
        date: sub.created_at,
        type: 'subscription',
        description: `${sub.plan_type} Subscription`,
        details: `Plan: ${sub.plan_type}, Status: ${sub.status}`,
        recipient_name: 'DropBy Platform',
        amount: sub.monthly_price || 0,
        status: sub.status === 'active' ? 'completed' : sub.status, // Map to payment status
        reference: sub.stripe_subscription_id || sub.id
      }))

      payments.value = [...payments.value, ...subscriptionPayments]
    }
  } catch (error) {
    console.error('Error loading subscription fees:', error)
  }
}

const getPaymentType = (payment: any): string => {
  if (payment.event_id) return 'event'
  return 'platform'
}

const getPaymentDescription = (payment: any): string => {
  if (payment.event_id && payment.events) {
    return `Event Payment: ${payment.events.event_name}`
  }
  return 'Platform Fee'
}

const getPaymentDetails = (payment: any): string => {
  if (payment.event_id && payment.events && payment.vendors) {
    return `Vendor: ${payment.vendors.vendor_name} | Date: ${new Date(payment.events.event_date).toLocaleDateString()}`
  }
  return `Platform fee: $${(payment.platform_fee / 100).toFixed(2)} | Processing fee: $${(payment.processing_fee / 100).toFixed(2)}`
}

const getRecipientName = (payment: any): string => {
  if (payment.vendor_id && payment.vendors) {
    return payment.vendors.vendor_name || 'Unknown Vendor'
  }
  if (payment.event_id && payment.events && payment.vendors) {
    return payment.vendors.vendor_name || 'Unknown Vendor'
  }
  return 'Platform Fees'
}

const getPaymentTypeLabel = (type: string): string => {
  switch (type) {
    case 'event': return 'Event Payment'
    case 'subscription': return 'Subscription'
    case 'platform': return 'Platform Fee'
    default: return type
  }
}

const getPaymentTypeSeverity = (type: string): string => {
  switch (type) {
    case 'event': return 'info'
    case 'subscription': return 'warning'
    case 'platform': return 'danger'
    default: return 'info'
  }
}

const getStatusSeverity = (status: string): string => {
  switch (status) {
    case 'completed': return 'success'
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'failed': return 'danger'
    case 'refunded': return 'warning'
    default: return 'info'
  }
}

const formatCurrency = (amount: number): string => {
  return amount.toFixed(2)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewPaymentDetails = (payment: Payment) => {
  selectedPayment.value = payment
  showPaymentModal.value = true
}

const exportPayments = () => {
  // TODO: Implement CSV export
  console.log('Export payments')
}

// Load payments on mount
onMounted(() => {
  loadPayments()
})
</script>
