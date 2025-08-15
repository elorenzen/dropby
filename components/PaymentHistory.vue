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

      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Processing Fees</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">
              ${{ formatCurrency(totalProcessingFees) }}
            </p>
          </div>
          <i class="pi pi-credit-card text-gray-500 text-xl"></i>
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


      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Merchant } from '~/types'

interface Props {
  merchantId: string
}

const props = defineProps<Props>()

// Types - Local interface for this component's payment data
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
  platform_fee?: number
  processing_fee?: number
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
  { label: 'Platform Fees', value: 'platform' },
  { label: 'Processing Fees', value: 'processing' }
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

  // Sort by date (most recent first)
  filtered.sort((a: Payment, b: Payment) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return filtered
})

const totalSpent = computed(() => {
  return payments.value.reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const totalEventPayments = computed(() => {
  // Event payments should only include the payout sum for food trucks (vendors)
  // This is the amount that goes to the vendor, not the total amount merchant pays
  return payments.value
    .filter((payment: Payment) => payment.type === 'event')
    .reduce((sum: number, payment: Payment) => {
      // For event payments, we want the vendor payout amount (amount minus platform and processing fees)
      const platformFee = payment.platform_fee || 0
      const processingFee = payment.processing_fee || 0
      // Determine if fees are in cents (need to divide by 100) or dollars
      const isFeesInCents = payment.amount > 100
      const adjustedPlatformFee = isFeesInCents ? platformFee / 100 : platformFee
      const adjustedProcessingFee = isFeesInCents ? processingFee / 100 : processingFee
      return sum + (payment.amount - adjustedPlatformFee - adjustedProcessingFee)
    }, 0)
})

const totalSubscriptionFees = computed(() => {
  return payments.value
    .filter((payment: Payment) => payment.type === 'subscription')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
})

const totalPlatformFees = computed(() => {
  // Platform fees should be the sum of all platform fees from all payments
  return payments.value.reduce((sum: number, payment: Payment) => {
    const platformFee = payment.platform_fee || 0
    // Determine if fees are in cents (need to divide by 100) or dollars
    const isFeesInCents = payment.amount > 100
    const adjustedPlatformFee = isFeesInCents ? platformFee / 100 : platformFee
    return sum + adjustedPlatformFee
  }, 0)
})

const totalProcessingFees = computed(() => {
  // Processing fees should be the sum of all processing fees from all payments
  return payments.value.reduce((sum: number, payment: Payment) => {
    const processingFee = payment.processing_fee || 0
    // Determine if fees are in cents (need to divide by 100) or dollars
    const isFeesInCents = payment.amount > 100
    const adjustedProcessingFee = isFeesInCents ? processingFee / 100 : processingFee
    return sum + adjustedProcessingFee
  }, 0)
})

// Methods
const loadPayments = async () => {
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    
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
      amount: payment.amount + (payment.platform_fee || 0) + (payment.processing_fee || 0), // Total amount merchant pays (fees are added as-is, scaling handled in computed properties)
      status: payment.status,
      reference: payment.stripe_payment_intent_id || payment.id,
      platform_fee: payment.platform_fee || 0,
      processing_fee: payment.processing_fee || 0
    }))

    await loadSubscriptionFees()
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
        reference: sub.stripe_subscription_id || sub.id,
        platform_fee: 0,
        processing_fee: 0
      }))

      payments.value = [...payments.value, ...subscriptionPayments]
    }
  } catch (error) {
    console.error('Error loading subscription fees:', error)
  }
}

const getPaymentType = (payment: any): string => {
  if (payment.event_id) return 'event'
  if (payment.processing_fee && payment.processing_fee > 0) return 'processing'
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
  if (payment.platform_fee || payment.processing_fee) {
    // Determine if fees are in cents (need to divide by 100) or dollars
    // If amount is > 100, fees are likely in cents; if amount is < 100, fees are likely in dollars
    const isFeesInCents = payment.amount > 100
    const platformFee = payment.platform_fee ? `Platform fee: $${isFeesInCents ? (payment.platform_fee / 100).toFixed(2) : payment.platform_fee.toFixed(2)}` : ''
    const processingFee = payment.processing_fee ? `Processing fee: $${isFeesInCents ? (payment.processing_fee / 100).toFixed(2) : payment.processing_fee.toFixed(2)}` : ''
    return [platformFee, processingFee].filter(Boolean).join(' | ')
  }
  return ''
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
    case 'processing': return 'Processing Fee'
    default: return type
  }
}

const getPaymentTypeSeverity = (type: string): string => {
  switch (type) {
    case 'event': return 'info'
    case 'subscription': return 'warning'
    case 'platform': return 'danger'
    case 'processing': return 'secondary'
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

const getMerchantInfo = async (merchantId: string) => {
  try {
    const supabase = useSupabaseClient()
    
    // Try to get merchant info from merchants table
    const { data: merchantData } = await supabase
      .from('merchants')
      .select('merchant_name, formatted_address, phone, email, avatar_url')
      .eq('id', merchantId)
      .single()
    
    if (merchantData) {
      return merchantData
    }
    
    // Fallback: try to get from payments data
    if (payments.value.length > 0) {
      const firstPayment = payments.value[0] as any
      return {
        merchant_name: firstPayment.merchant_name || firstPayment.business_name,
        formatted_address: firstPayment.business_address || firstPayment.address || firstPayment.formatted_address,
        phone: firstPayment.business_phone || firstPayment.phone,
        email: firstPayment.business_email || firstPayment.email,
        avatar_url: firstPayment.business_logo || firstPayment.logo_url || firstPayment.avatar_url
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting merchant info:', error)
    return null
  }
}

const exportPayments = async () => {
  exporting.value = true
  try {
    // Import jsPDF dynamically to avoid SSR issues
    const jsPDF = (await import('jspdf')).default
    const pdf = new jsPDF()
    
    // Set up fonts and styling
    pdf.setFont('helvetica')
    
    // Get merchant/business information
    const merchantInfo = await getMerchantInfo(props.merchantId)
    const businessName = merchantInfo?.merchant_name || 'Merchant Account'
    
    if (!businessName || businessName === 'Merchant Account') {
      throw new Error('Unable to retrieve merchant business name')
    }
    
    // Add actual merchant logo if available (positioned to the left of business name)
    if (merchantInfo?.avatar_url) {
      try {
        // Fetch the logo image
        const response = await fetch(merchantInfo.avatar_url)
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Convert to base64
        let binary = ''
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i])
        }
        const base64 = btoa(binary)
        
        // Determine image type
        const imageType = merchantInfo.avatar_url.toLowerCase().includes('.png') ? 'PNG' : 'JPEG'
        
        // Add image to PDF (positioned at 20, 25 with 35x35 dimensions for header)
        pdf.addImage(base64, imageType, 20, 25, 35, 35)
      } catch (logoError) {
        console.warn('Could not load merchant logo:', logoError)
        // Fallback to text-based logo if image fails
        pdf.setFillColor(240, 240, 240)
        pdf.rect(20, 25, 35, 35, 'F')
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        const initials = businessName.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 3)
        pdf.text(initials, 32, 42)
      }
    } else {
      // No logo available, use business name initials
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, 25, 35, 35, 'F')
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      const initials = businessName.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 3)
      pdf.text(initials, 32, 42)
    }
    
    // Header section with merchant branding (logo + business name side by side)
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    
    // Handle long business names with text wrapping
    const maxBusinessNameWidth = 120 // Maximum width for business name
    let businessNameFontSize = 28
    let businessNameY = 42
    
    // Reduce font size if business name is too long
    if (businessName.length > 20) {
      businessNameFontSize = 24
      businessNameY = 40
    }
    if (businessName.length > 30) {
      businessNameFontSize = 20
      businessNameY = 38
    }
    if (businessName.length > 40) {
      businessNameFontSize = 16
      businessNameY = 36
    }
    
    pdf.setFontSize(businessNameFontSize)
    
    // Split long business names into multiple lines if needed
    if (businessName.length > 25) {
      const words = businessName.split(' ')
      let currentLine = ''
      let lineCount = 0
      const maxLines = 2
      
      for (const word of words) {
        if ((currentLine + ' ' + word).length > 25 && lineCount < maxLines - 1) {
          pdf.text(currentLine.trim(), 65, businessNameY + (lineCount * 8))
          currentLine = word
          lineCount++
        } else {
          currentLine += (currentLine ? ' ' : '') + word
        }
      }
      if (currentLine && lineCount < maxLines) {
        pdf.text(currentLine.trim(), 65, businessNameY + (lineCount * 8))
        businessNameY += (lineCount + 1) * 8
      }
    } else {
      pdf.text(businessName, 65, businessNameY)
      businessNameY += 20
    }
    
    // Position "Transaction Report" below the business name with proper spacing
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Transaction Report', 65, businessNameY + 5)
    
    // Subtitle with DropBy branding (smaller, secondary)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    
    // Merchant details section
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    
    // Right-aligned merchant info
    const rightAlignX = 170
    pdf.text('Report Details:', rightAlignX, 30)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    const dateRangeText = dateRange.value && dateRange.value[0] && dateRange.value[1] 
      ? `${formatDate(dateRange.value[0].toISOString())} - ${formatDate(dateRange.value[1].toISOString())}`
      : 'All Time'
    
    pdf.text(`Period: ${dateRangeText}`, rightAlignX, 40)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, rightAlignX, 50)
    pdf.text(`Time: ${new Date().toLocaleTimeString()}`, rightAlignX, 60)
    
    // Business contact info (if available) - positioned below the header section
    if (merchantInfo?.formatted_address || merchantInfo?.phone || merchantInfo?.email) {
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      let contactY = businessNameY + 25 // Dynamic positioning based on header height
      
      if (merchantInfo?.formatted_address) {
        pdf.text(`Address: ${merchantInfo.formatted_address}`, 20, contactY)
        contactY += 5
      }
      if (merchantInfo?.phone) {
        pdf.text(`Phone: ${merchantInfo.phone}`, 20, contactY)
        contactY += 5
      }
      if (merchantInfo?.email) {
        pdf.text(`Email: ${merchantInfo.email}`, 20, contactY)
      }
      
      // Divider line positioned after contact info
      pdf.line(20, contactY + 5, 190, contactY + 5)
      
      // Summary section positioned after divider
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Financial Summary', 20, contactY + 20)
    } else {
      // No contact info, position divider and summary after header
      const dividerY = businessNameY + 25
      pdf.line(20, dividerY, 190, dividerY)
      
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Financial Summary', 20, dividerY + 15)
    }
    
    // Summary table
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    const summaryData = [
      ['Total Spent', `$${formatCurrency(totalSpent.value)}`],
      ['Event Payments', `$${formatCurrency(totalEventPayments.value)}`],
      ['Subscription Fees', `$${formatCurrency(totalSubscriptionFees.value)}`],
      ['Platform Fees', `$${formatCurrency(totalPlatformFees.value)}`],
      ['Processing Fees', `$${formatCurrency(totalProcessingFees.value)}`]
    ]
    
    let yPos = 150
    summaryData.forEach(([label, value]) => {
      pdf.text(label, 20, yPos)
      pdf.text(value, 120, yPos)
      yPos += 8
    })
    
    // Divider line
    pdf.line(20, yPos + 5, 190, yPos + 5)
    yPos += 15
    
    // Transactions table
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Transaction Details', 20, yPos)
    
    // Table headers
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    const headers = ['Date', 'Type', 'Description', 'Recipient', 'Amount', 'Status']
    const columnWidths = [25, 25, 50, 35, 25, 25]
    let xPosition = 20
    let yPosition = yPos + 10
    
    // Draw headers
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition)
      xPosition += columnWidths[index]
    })
    
    // Draw header line
    pdf.line(20, yPosition + 2, 190, yPosition + 2)
    yPosition += 10
    
    // Add transactions
    const transactionsToExport = filteredPayments.value.slice(0, 20) // Limit to first 20 for PDF
    
    transactionsToExport.forEach((payment: Payment, index: number) => {
      if (yPosition > 270) {
        // Add new page if we're running out of space
        pdf.addPage()
        yPosition = 20
        
        // Redraw headers on new page
        pdf.setFontSize(9)
        xPosition = 20
        headers.forEach((header, headerIndex) => {
          pdf.text(header, xPosition, yPosition)
          xPosition += columnWidths[headerIndex]
        })
        pdf.line(20, yPosition + 2, 190, yPosition + 2)
        yPosition += 10
      }
      
      xPosition = 20
      
      // Date
      pdf.text(formatDate(payment.date), xPosition, yPosition)
      xPosition += columnWidths[0]
      
      // Type
      pdf.text(getPaymentTypeLabel(payment.type), xPosition, yPosition)
      xPosition += columnWidths[1]
      
      // Description (truncate if too long)
      const description = payment.description.length > 20 ? payment.description.substring(0, 17) + '...' : payment.description
      pdf.text(description, xPosition, yPosition)
      xPosition += columnWidths[2]
      
      // Recipient (truncate if too long)
      const recipient = payment.recipient_name.length > 15 ? payment.recipient_name.substring(0, 12) + '...' : payment.recipient_name
      pdf.text(recipient, xPosition, yPosition)
      xPosition += columnWidths[3]
      
      // Amount
      pdf.text(`-$${formatCurrency(payment.amount)}`, xPosition, yPosition)
      xPosition += columnWidths[4]
      
      // Status
      pdf.text(payment.status, xPosition, yPosition)
      
      yPosition += 8
    })
    
    // Footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      
      // Footer line
      pdf.line(20, 280, 190, 280)
      
      // Footer text
      pdf.text(`Page ${i} of ${totalPages}`, 20, 285)
      pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 80, 285)
      pdf.text('DropBy Platform', 150, 285)
    }
    
    // Save the PDF
    const fileName = `payment-history-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback to simple text export if PDF fails
    exportAsText()
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
      Recipient: payment.recipient_name,
      Amount: `-$${formatCurrency(payment.amount)}`,
      Status: payment.status
    }))
    
    const csvContent = [
      ['Date', 'Type', 'Description', 'Recipient', 'Amount', 'Status'],
      ...data.map((row: any) => Object.values(row))
    ].map((row: any) => row.map((cell: any) => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payment-history-${new Date().toISOString().split('T')[0]}.csv`)
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
