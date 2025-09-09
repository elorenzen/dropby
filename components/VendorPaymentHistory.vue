<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-text-main flex items-center gap-3">
        <i class="pi pi-credit-card text-green-600"></i>
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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-600 dark:text-green-400 font-medium">Total Earned</p>
            <p class="text-2xl font-bold text-green-800 dark:text-green-200">
              ${{ formatCurrency(totalEarned) }}
            </p>
          </div>
          <i class="pi pi-dollar text-green-500 text-xl"></i>
        </div>
      </div>

      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">This Month</p>
            <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">
              ${{ formatCurrency(monthlyEarnings) }}
            </p>
          </div>
          <i class="pi pi-calendar text-blue-500 text-xl"></i>
        </div>
      </div>

      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pending Payments</p>
            <p class="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              ${{ formatCurrency(pendingPayments) }}
            </p>
          </div>
          <i class="pi pi-clock text-yellow-500 text-xl"></i>
        </div>
      </div>

      <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Completed Events</p>
            <p class="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {{ completedEventsCount }}
            </p>
          </div>
          <i class="pi pi-check-circle text-purple-500 text-xl"></i>
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

        <Column field="merchant" header="Merchant" sortable>
          <template #body="{ data }">
            <span v-if="data.merchant_name" class="font-medium">{{ data.merchant_name }}</span>
            <span v-else class="text-text-muted">—</span>
          </template>
        </Column>

        <Column field="amount" header="Amount" sortable>
          <template #body="{ data }">
            <span class="font-bold text-green-600">+${{ formatCurrency(data.amount) }}</span>
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
  merchant_name: string
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
      payment.details?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.merchant_name.toLowerCase().includes(searchQuery.value.toLowerCase())
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

  // Sort by date (most recent first)
  filtered.sort((a: Payment, b: Payment) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return filtered
})

const totalEarned = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.status === 'completed')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const monthlyEarnings = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  return payments.value
    .filter((payment: Payment) => {
      const paymentDate = new Date(payment.date)
      return payment.status === 'completed' && 
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
    .filter((payment: Payment) => payment.status === 'completed')
    .length
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

    // Load related event and merchant data
    if (paymentsData && paymentsData.length > 0) {
      const eventIds = paymentsData.filter((p: any) => p.event_id).map((p: any) => p.event_id)
      const merchantIds = paymentsData.filter((p: any) => p.merchant_id).map((p: any) => p.merchant_id)
      
      let eventsData: any = {}
      let merchantsData: any = {}
      
      if (eventIds.length > 0) {
        const { data: events } = await supabase
          .from('events')
          .select('id, event_name, start, end, location_address')
          .in('id', eventIds)
        eventsData = events?.reduce((acc: any, event: any) => {
          acc[event.id] = event
          return acc
        }, {}) || {}
      }
      
      if (merchantIds.length > 0) {
        const { data: merchants } = await supabase
          .from('merchants')
          .select('id, merchant_name')
          .in('id', merchantIds)
        merchantsData = merchants?.reduce((acc: any, merchant: any) => {
          acc[merchant.id] = merchant
          return acc
        }, {}) || {}
      }
      
      // Attach related data to payments
      paymentsData = paymentsData.map((payment: any) => ({
        ...payment,
        events: eventsData[payment.event_id],
        merchants: merchantsData[payment.merchant_id]
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
      merchant_name: getMerchantName(payment),
      amount: payment.vendor_payout || payment.amount, // Vendor receives the vendor_payout amount
      status: payment.status,
      reference: payment.stripe_payment_intent_id || payment.id,
      event_id: payment.event_id
    }))

  } catch (error) {
    console.error('Error loading vendor payments:', error)
  } finally {
    loading.value = false
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

const getMerchantName = (payment: any): string => {
  if (payment.merchant_id && payment.merchants) {
    return payment.merchants.merchant_name || 'Unknown Merchant'
  }
  return 'Unknown Merchant'
}

const getPaymentTypeLabel = (type: string): string => {
  switch (type) {
    case 'event': return 'Event Payment'
    case 'other': return 'Other'
    default: return type
  }
}

const getPaymentTypeSeverity = (type: string): string => {
  switch (type) {
    case 'event': return 'success'
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
      Merchant: payment.merchant_name,
      Amount: `+$${formatCurrency(payment.amount)}`,
      Status: payment.status
    }))
    
    const csvContent = [
      ['Date', 'Type', 'Description', 'Merchant', 'Amount', 'Status'],
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
