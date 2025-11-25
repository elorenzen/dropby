<template>
  <div class="bg-surface-card rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-color flex items-center gap-3">
        <i class="pi pi-credit-card text-success"></i>
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
          :label="exporting ? 'Generating PDF...' : 'Export PDF'"
          :icon="exporting ? 'pi pi-spinner pi-spin' : 'pi pi-download'"
          severity="secondary"
          outlined
          size="small"
          :disabled="exporting"
          @click="exportPayments"
        />
      </div>
    </div>

    <!-- Payment Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-success-light rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-success font-medium">Total Earned</p>
            <p class="text-2xl font-bold text-success-dark">
              ${{ formatCurrency(totalEarned) }}
            </p>
          </div>
          <i class="pi pi-dollar text-success text-xl"></i>
        </div>
      </div>

      <div class="bg-primary-light rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-primary font-medium">This Month</p>
            <p class="text-2xl font-bold text-primary-dark">
              ${{ formatCurrency(monthlyEarnings) }}
            </p>
          </div>
          <i class="pi pi-calendar text-primary text-xl"></i>
        </div>
      </div>

      <div class="bg-accent-light rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-accent font-medium">Pending Payments</p>
            <p class="text-2xl font-bold text-accent-dark">
              ${{ formatCurrency(pendingPayments) }}
            </p>
          </div>
          <i class="pi pi-clock text-accent text-xl"></i>
        </div>
      </div>

      <div class="bg-primary-light rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-primary font-medium">Completed Events</p>
            <p class="text-2xl font-bold text-primary-dark">
              {{ completedEventsCount }}
            </p>
          </div>
          <i class="pi pi-check-circle text-primary text-xl"></i>
        </div>
      </div>

      <div class="bg-accent-light rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-accent font-medium">Subscription Fees</p>
            <p class="text-2xl font-bold text-accent-dark">
              ${{ formatCurrency(totalSubscriptionFees) }}
            </p>
          </div>
          <i class="pi pi-star text-accent text-xl"></i>
        </div>
      </div>
    </div>

    <!-- Payment History Table -->
    <div class="bg-surface-section rounded-lg p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-color">Recent Payments</h3>
        <div class="flex items-center gap-2">
          <InputText 
            v-model="searchQuery" 
            placeholder="Search payments..."
            class="w-48"
          />
          <Select
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
        emptyMessage="No payments found. Payments will appear here once you complete events."
        sortField="date"
        :sortOrder="-1"
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

        <Column field="amount" header="Amount" sortable>
          <template #body="{ data }">
            <span 
              v-if="data.type === 'subscription'" 
              class="font-bold text-error"
            >
              -${{ formatCurrency(data.amount) }}
            </span>
            <span 
              v-else 
              class="font-bold text-success"
            >
              +${{ formatCurrency(data.amount) }}
            </span>
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
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { vendorPlans } from '~/constants/subscriptionPlans'

interface Props {
  vendorId: string
}

const props = defineProps<Props>()

// Types - Local interface for this component's payment data
interface Payment {
  id: string
  date: string
  type: string
  description: string
  details?: string
  amount: number
  status: string
  reference: string
  event_id?: string
}

// State
const loading = ref(false)
const exporting = ref(false)
const payments = ref<Payment[]>([])
const dateRange = ref<[Date, Date] | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('all')

// Payment categories for filtering
const paymentCategories = [
  { label: 'All Categories', value: 'all' },
  { label: 'Event Payments', value: 'event' },
  { label: 'Subscription Fees', value: 'subscription' },
  { label: 'Pending Payments', value: 'pending' },
  { label: 'Completed Payments', value: 'completed' }
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
    if (selectedCategory.value === 'pending' || selectedCategory.value === 'completed') {
      // Filter by status for pending/completed
      filtered = filtered.filter((payment: Payment) => payment.status === selectedCategory.value)
    } else {
      // Filter by type for event/subscription
      filtered = filtered.filter((payment: Payment) => payment.type === selectedCategory.value)
    }
  }

  // Filter by date range
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    filtered = filtered.filter((payment: Payment) => {
      const paymentDate = new Date(payment.date)
      return paymentDate >= dateRange.value![0] && paymentDate <= dateRange.value![1]
    })
  }

  // Sort by date (most recent first)
  filtered.sort((a: Payment, b: Payment) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return filtered
})

const totalEarned = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.status === 'completed' && payment.type === 'event')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const monthlyEarnings = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  return payments.value
    .filter((payment: Payment) => {
      const paymentDate = new Date(payment.date)
      return payment.status === 'completed' && 
             payment.type === 'event' &&
             paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear
    })
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const pendingPayments = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.status === 'pending')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const completedEventsCount = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.status === 'completed' && payment.type === 'event')
    .length
})

const totalSubscriptionFees = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.type === 'subscription')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

// Methods
const loadPayments = async () => {
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    
    // Load payments where this vendor is the recipient
    let { data: paymentsData, error } = await supabase
      .from('payments')
      .select('*')
      .eq('vendor_id', props.vendorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading payments:', error)
      throw error
    }

    // Load related event data (no merchant data for vendor payment history)
    if (paymentsData && paymentsData.length > 0) {
      const eventIds = paymentsData.filter((p: any) => p.event_id).map((p: any) => p.event_id)
      
      let eventsData: any = {}
      
      if (eventIds.length > 0) {
        // Load events (without merchant information)
        const { data: events } = await supabase
          .from('events')
          .select('id, event_name, start, end, location_address')
          .in('id', eventIds)
        eventsData = events?.reduce((acc: any, event: any) => {
          acc[event.id] = event
          return acc
        }, {}) || {}
      }
      
      // Attach event data to payments (no merchant data)
      paymentsData = paymentsData.map((payment: any) => ({
        ...payment,
        events: eventsData[payment.event_id]
      }))
    }

    console.log('Vendor payments data loaded:', paymentsData)

    // Transform the data for display
    payments.value = (paymentsData || []).map((payment: any) => ({
      id: payment.id,
      date: payment.created_at,
      type: getPaymentType(payment),
      description: getPaymentDescription(payment),
      details: getPaymentDetails(payment),
      amount: payment.vendor_payout || payment.amount, // Vendor receives the vendor_payout amount
      status: payment.status,
      reference: payment.stripe_payment_intent_id || payment.id,
      event_id: payment.event_id
    }))

    await loadSubscriptionFees()
  } catch (error) {
    console.error('Error loading vendor payments:', error)
  } finally {
    loading.value = false
  }
}

// Helper function to get subscription price from plan type
const getSubscriptionPrice = (planType: string): number => {
  const planId = `vendor-${planType}`
  const plan = vendorPlans.find(p => p.id === planId)
  return plan?.price || 0
}

const loadSubscriptionFees = async () => {
  try {
    const supabase = useSupabaseClient()
    
    // Load subscription data to calculate fees for vendors
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', props.vendorId)
      .eq('business_type', 'vendor')
      .order('created_at', { ascending: false })

    if (subscriptions && subscriptions.length > 0) {
      // Add subscription fees to payments (as negative amounts since vendor pays these)
      const subscriptionPayments = subscriptions.map((sub: any) => {
        const price = getSubscriptionPrice(sub.plan_type)
        return {
          id: `sub_${sub.id}`,
          date: sub.created_at,
          type: 'subscription',
          description: `${sub.plan_type.charAt(0).toUpperCase() + sub.plan_type.slice(1)} Subscription`,
          details: `Plan: ${sub.plan_type}, Status: ${sub.status}`,
          amount: price,
          status: sub.status === 'active' ? 'completed' : sub.status,
          reference: sub.stripe_subscription_id || sub.id,
          event_id: undefined
        }
      })

      payments.value = [...payments.value, ...subscriptionPayments]
    }
  } catch (error) {
    console.error('Error loading subscription fees:', error)
  }
}

const getPaymentType = (payment: any): string => {
  if (payment.event_id) return 'event'
  return 'other'
}

const getPaymentDescription = (payment: any): string => {
  if (payment.event_id && payment.events) {
    return `Event Payment: ${payment.events.event_name}`
  }
  return 'Payment'
}

const getPaymentDetails = (payment: any): string => {
  if (payment.event_id && payment.events) {
    const eventDate = new Date(payment.events.start).toLocaleDateString()
    const location = payment.events.location_address || 'Location TBD'
    return `Date: ${eventDate} | Location: ${location}`
  }
  return ''
}

const getPaymentTypeLabel = (type: string): string => {
  switch (type) {
    case 'event': return 'Event Payment'
    case 'subscription': return 'Subscription'
    case 'other': return 'Other'
    default: return type
  }
}

const getPaymentTypeSeverity = (type: string): string => {
  switch (type) {
    case 'event': return 'success'
    case 'subscription': return 'warning'
    case 'other': return 'info'
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

const exportPayments = async () => {
  exporting.value = true
  try {
    // Simple CSV export for now
    exportAsText()
  } catch (error) {
    console.error('Error exporting payments:', error)
  } finally {
    exporting.value = false
  }
}

const exportAsText = () => {
  try {
    const data = filteredPayments.value.map((payment: Payment) => ({
      Date: formatDate(payment.date),
      Type: getPaymentTypeLabel(payment.type),
      Description: payment.description,
      Amount: payment.type === 'subscription' 
        ? `-$${formatCurrency(payment.amount)}` 
        : `+$${formatCurrency(payment.amount)}`,
      Status: payment.status
    }))
    
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status'],
      ...data.map((row: any) => Object.values(row))
    ].map((row: any) => row.map((cell: any) => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `vendor-payment-history-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error exporting as CSV:', error)
  }
}

onMounted(() => {
  loadPayments()
})
</script>
