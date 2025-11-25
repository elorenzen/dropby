<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Analytics
          </h1>
          <p class="text-text-muted text-lg">
            View analytics for {{ vendor?.vendor_name || 'your business' }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Select 
            v-model="selectedPeriod" 
            :options="periodOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select Period"
            class="w-56"
          />
          <Button 
            icon="pi pi-arrow-left" 
            @click="navigateToDashboard"
            outlined 
            label="Back to Dashboard"
          />
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Acceptance Rate</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.acceptanceRate }}%</p>
              <p class="text-success text-sm mt-1">
                <i class="pi pi-check-circle mr-1"></i>
                {{ metrics.totalBookings }} of {{ metrics.pendingRequests }} requests accepted
              </p>
            </div>
            <div class="analytics-icon bg-success/20">
              <i class="pi pi-check text-success text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Total Bookings</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.totalBookings }}</p>
              <p class="text-primary text-sm mt-1">
                <i class="pi pi-calendar mr-1"></i>
                Accepted & completed events
              </p>
            </div>
            <div class="analytics-icon bg-primary/20">
              <i class="pi pi-calendar text-primary text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Merchant Partners</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.uniqueMerchants }}</p>
              <p class="text-accent text-sm mt-1">
                <i class="pi pi-users mr-1"></i>
                {{ metrics.repeatMerchants }} repeat partners
              </p>
            </div>
            <div class="analytics-icon bg-accent/20">
              <i class="pi pi-building text-accent text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Bookings Over Time Chart -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold text-text-main">Bookings {{ selectedPeriodLabel }}</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Line 
              :data="bookingsChartData" 
              :options="chartOptions"
              v-if="bookingsChartData"
            />
          </div>
        </template>
      </Card>

      <!-- Peak Booking Days -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold text-text-main">Peak Booking Days</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Bar 
              :data="peakDaysChartData" 
              :options="horizontalChartOptions"
              v-if="peakDaysChartData"
            />
          </div>
        </template>
      </Card>

      <!-- Peak Booking Hours -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold text-text-main">Peak Booking Hours</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Bar 
              :data="peakHoursChartData" 
              :options="chartOptions"
              v-if="peakHoursChartData"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Top Merchant Partners -->
    <Card class="mb-8">
      <template #title>
        <h3 class="text-xl font-semibold text-text-main">Top Merchant Partners</h3>
      </template>
      <template #content>
        <div class="h-80">
          <Bar 
            :data="merchantsChartData" 
            :options="horizontalChartOptions"
            v-if="merchantsChartData"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const vendorStore = useVendorStore()
const vendor = ref<any>(null)
const supabase = useSupabaseClient()

// Period selection
const selectedPeriod = ref('30d')
const periodOptions = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Last Year', value: '1y' },
  { label: 'All Time', value: 'all' }
]

// Computed property for period label
const selectedPeriodLabel = computed(() => {
  const option = periodOptions.find(opt => opt.value === selectedPeriod.value)
  return option ? option.label : 'Over Time'
})

// Analytics data
const metrics = ref({
  acceptanceRate: 0,
  totalBookings: 0,
  pendingRequests: 0,
  uniqueMerchants: 0,
  repeatMerchants: 0,
  avgBookingsPerMerchant: 0
})

// Chart data
const bookingsChartData = ref<any>(null)
const peakDaysChartData = ref<any>(null)
const peakHoursChartData = ref<any>(null)
const merchantsChartData = ref<any>(null)

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#0891B2',
      borderWidth: 2,
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#e5e7eb',
        font: {
          size: 12
        }
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.15)',
        lineWidth: 1
      }
    },
    y: {
      min: 0,
      ticks: {
        color: '#e5e7eb',
        font: {
          size: 12
        },
        stepSize: 1
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.15)',
        lineWidth: 1
      }
    }
  }
}

const horizontalChartOptions = {
  ...chartOptions,
  indexAxis: 'y' as const
}

// Navigation
const navigateToDashboard = () => {
  navigateTo(`/vendor/${route.params.id}/dashboard`)
}

// Load analytics data
const loadAnalyticsData = async () => {
  try {
    // Load vendor
    if (!vendor.value) {
      const vendors = await vendorStore.loadVendors()
      vendor.value = vendors?.find((v: any) => v.id === route.params.id)
    }

    if (!vendor.value?.id) return

    const vendorId = vendor.value.id
    const periodStart = getPeriodStart(selectedPeriod.value)

    // Get all events where this vendor has pending requests OR is booked
    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: true })

    if (!allEvents) return

    // Filter events by period - use event start date (when event happened) for filtering
    const periodEvents = selectedPeriod.value === 'all' 
      ? allEvents 
      : allEvents.filter((event: any) => 
          new Date(event.start) >= periodStart
        )

    // Get all events for this vendor (matches past events page logic - all events where vendor is assigned)
    const acceptedEvents = periodEvents.filter((event: any) => 
      event.vendor === vendorId
    )

    // Get requests that vendor made (vendor_id in pending_requests array)
    const pendingRequests = periodEvents.filter((event: any) => 
      event.pending_requests && 
      Array.isArray(event.pending_requests) && 
      event.pending_requests.includes(vendorId)
    )

    await processAnalyticsData(acceptedEvents, pendingRequests, periodEvents, vendorId)
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

// Process analytics data
const processAnalyticsData = async (
  acceptedEvents: any[], 
  pendingRequests: any[],
  allPeriodEvents: any[],
  vendorId: string
) => {
  // Acceptance Rate: (Accepted + Completed events) / (Pending requests vendor made)
  metrics.value.totalBookings = acceptedEvents.length
  metrics.value.pendingRequests = pendingRequests.length
  metrics.value.acceptanceRate = pendingRequests.length > 0
    ? Math.round((acceptedEvents.length / pendingRequests.length) * 100)
    : 0

  // Calculate merchant relationship metrics
  const merchantIds = acceptedEvents
    .map(event => event.merchant)
    .filter((id): id is string => id !== null && id !== undefined)
  
  const uniqueMerchantSet = new Set(merchantIds)
  metrics.value.uniqueMerchants = uniqueMerchantSet.size

  // Count repeat merchants (merchants with >1 booking)
  const merchantCounts: { [key: string]: number } = {}
  merchantIds.forEach(id => {
    merchantCounts[id] = (merchantCounts[id] || 0) + 1
  })
  metrics.value.repeatMerchants = Object.values(merchantCounts).filter(count => count > 1).length
  metrics.value.avgBookingsPerMerchant = uniqueMerchantSet.size > 0
    ? Math.round((acceptedEvents.length / uniqueMerchantSet.size) * 10) / 10
    : 0

  // Generate chart data
  await generateChartData(acceptedEvents, merchantCounts, allPeriodEvents, vendorId)
}

// Generate chart data
const generateChartData = async (
  acceptedEvents: any[], 
  merchantCounts: { [key: string]: number },
  allPeriodEvents: any[],
  vendorId: string
) => {
  // Bookings over time - generate continuous time series
  const bookingsTimeSeries = generateBookingsTimeSeries(acceptedEvents, selectedPeriod.value)
  bookingsChartData.value = {
    labels: bookingsTimeSeries.labels,
    datasets: [{
      label: 'Bookings',
      data: bookingsTimeSeries.data,
      borderColor: '#0891B2', // Primary cyan
      backgroundColor: 'rgba(8, 145, 178, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0891B2',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  }

  // Peak booking days
  const dayCounts = countBookingDays(acceptedEvents)
  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayColors = [
    'rgba(239, 68, 68, 0.8)',   // Red for Sunday
    'rgba(59, 130, 246, 0.8)',  // Blue for Monday
    'rgba(16, 185, 129, 0.8)',  // Green for Tuesday
    'rgba(245, 158, 11, 0.8)',  // Yellow for Wednesday
    'rgba(139, 92, 246, 0.8)',  // Purple for Thursday
    'rgba(236, 72, 153, 0.8)',  // Pink for Friday
    'rgba(249, 115, 22, 0.8)'   // Orange for Saturday
  ]
  peakDaysChartData.value = {
    labels: dayLabels,
    datasets: [{
      label: '', // Empty label since legend is disabled
      data: dayLabels.map((_, index) => dayCounts[index] || 0),
      backgroundColor: dayColors,
      borderColor: dayColors.map(c => c.replace('0.8', '1')),
      borderWidth: 2
    }]
  }

  // Peak booking hours
  const hourCounts = countBookingHours(acceptedEvents)
  peakHoursChartData.value = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Bookings',
      data: Array.from({ length: 24 }, (_, i) => hourCounts[i] || 0),
      backgroundColor: 'rgba(8, 145, 178, 0.7)', // Primary cyan
      borderColor: '#0891B2',
      borderWidth: 2
    }]
  }

  // Top merchant partners
  const sortedMerchants = Object.entries(merchantCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  
  // Get merchant names
  const merchantStore = useMerchantStore()
  // Load merchants if not already loaded
  if (merchantStore.getAllMerchants.length === 0) {
    await merchantStore.loadMerchants()
  }
  const merchantNames = sortedMerchants.map(([id]) => {
    const merchant = merchantStore.getAllMerchants.find((m: any) => m.id === id)
    return merchant?.merchant_name || `Merchant ${id.slice(0, 8)}`
  })

  // Generate colors for merchant partners
  const merchantColors = [
    'rgba(8, 145, 178, 0.8)',   // Primary cyan
    'rgba(16, 185, 129, 0.8)',  // Green
    'rgba(245, 158, 11, 0.8)',  // Yellow
    'rgba(139, 92, 246, 0.8)',  // Purple
    'rgba(236, 72, 153, 0.8)'   // Pink
  ]
  merchantsChartData.value = {
    labels: merchantNames,
    datasets: [{
      label: 'Bookings',
      data: sortedMerchants.map(([, count]) => count),
      backgroundColor: merchantColors.slice(0, sortedMerchants.length),
      borderColor: merchantColors.slice(0, sortedMerchants.length).map(c => c.replace('0.8', '1')),
      borderWidth: 2
    }]
  }
}

// Helper functions
const getPeriodStart = (period: string) => {
  if (period === 'all') return new Date(0) // Beginning of time
  const now = new Date()
  switch (period) {
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '6m': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

const getPeriodDuration = (period: string) => {
  if (period === 'all') return 0
  switch (period) {
    case '7d': return 7 * 24 * 60 * 60 * 1000
    case '30d': return 30 * 24 * 60 * 60 * 1000
    case '90d': return 90 * 24 * 60 * 60 * 1000
    case '6m': return 180 * 24 * 60 * 60 * 1000
    case '1y': return 365 * 24 * 60 * 60 * 1000
    default: return 30 * 24 * 60 * 60 * 1000
  }
}

// Generate continuous time series for bookings chart
const generateBookingsTimeSeries = (events: any[], period: string) => {
  const now = new Date()
  const periodStart = getPeriodStart(period)
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Today at midnight
  
  // Determine interval based on period
  let interval: 'daily' | '3day' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  let dateFormat: (date: Date) => string
  
  if (period === '7d') {
    interval = 'daily'
    dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  } else if (period === '30d') {
    interval = '3day'
    dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  } else if (period === '90d') {
    interval = 'weekly'
    dateFormat = (date: Date) => {
      // Get start of week (Sunday)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      return weekStart.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    }
  } else if (period === '6m') {
    interval = 'biweekly'
    dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  } else if (period === '1y') {
    interval = 'monthly'
    dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } else {
    // All time - monthly or yearly depending on range
    const daysDiff = Math.ceil((endDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 730) { // More than 2 years
      interval = 'yearly'
      dateFormat = (date: Date) => date.getFullYear().toString()
    } else {
      interval = 'monthly'
      dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  }
  
  // Generate date labels and buckets
  const labels: string[] = []
  const data: number[] = []
  const buckets: { [key: string]: number } = {}
  
  // Initialize buckets with zeros
  let currentDate = new Date(periodStart)
  while (currentDate <= endDate) {
    let bucketKey: string
    let nextDate: Date
    
    if (interval === 'daily') {
      bucketKey = dateFormat(currentDate)
      nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)
    } else if (interval === '3day') {
      // Use current date as bucket key (will be rounded to 3-day intervals)
      bucketKey = dateFormat(currentDate)
      nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 3)
    } else if (interval === 'weekly') {
      // Get start of week (Sunday)
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay())
      bucketKey = dateFormat(weekStart)
      nextDate = new Date(weekStart)
      nextDate.setDate(nextDate.getDate() + 7)
    } else if (interval === 'biweekly') {
      // Round to nearest 2-week interval (every other Sunday)
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay())
      const weeksSinceEpoch = Math.floor(weekStart.getTime() / (1000 * 60 * 60 * 24 * 7))
      const biweekStart = new Date(weekStart)
      biweekStart.setDate(weekStart.getDate() - (weeksSinceEpoch % 2) * 7)
      bucketKey = dateFormat(biweekStart)
      nextDate = new Date(biweekStart)
      nextDate.setDate(nextDate.getDate() + 14)
    } else if (interval === 'monthly') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      bucketKey = dateFormat(monthStart)
      nextDate = new Date(monthStart)
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else { // yearly
      const yearStart = new Date(currentDate.getFullYear(), 0, 1)
      bucketKey = dateFormat(yearStart)
      nextDate = new Date(yearStart)
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    }
    
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = 0
      labels.push(bucketKey)
    }
    
    currentDate = nextDate
  }
  
  // Map events to buckets
  events.forEach(event => {
    const eventDate = new Date(event.start)
    let bucketKey: string
    
    if (interval === 'daily') {
      bucketKey = dateFormat(eventDate)
    } else if (interval === '3day') {
      // Round to nearest 3-day interval (every 3 days starting from period start)
      const daysSinceStart = Math.floor((eventDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      const intervalIndex = Math.floor(daysSinceStart / 3)
      const intervalStart = new Date(periodStart)
      intervalStart.setDate(periodStart.getDate() + (intervalIndex * 3))
      bucketKey = dateFormat(intervalStart)
    } else if (interval === 'weekly') {
      const weekStart = new Date(eventDate)
      weekStart.setDate(eventDate.getDate() - eventDate.getDay())
      bucketKey = dateFormat(weekStart)
    } else if (interval === 'biweekly') {
      const weekStart = new Date(eventDate)
      weekStart.setDate(eventDate.getDate() - eventDate.getDay())
      const weeksSinceEpoch = Math.floor(weekStart.getTime() / (1000 * 60 * 60 * 24 * 7))
      const biweekStart = new Date(weekStart)
      biweekStart.setDate(weekStart.getDate() - (weeksSinceEpoch % 2) * 7)
      bucketKey = dateFormat(biweekStart)
    } else if (interval === 'monthly') {
      const monthStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)
      bucketKey = dateFormat(monthStart)
    } else { // yearly
      const yearStart = new Date(eventDate.getFullYear(), 0, 1)
      bucketKey = dateFormat(yearStart)
    }
    
    if (buckets[bucketKey] !== undefined) {
      buckets[bucketKey]++
    }
  })
  
  // Convert to data array in label order
  data.push(...labels.map(label => buckets[label] || 0))
  
  return { labels, data }
}


const countBookingDays = (events: any[]) => {
  const counts: { [key: number]: number } = {}
  events.forEach(event => {
    const dayOfWeek = new Date(event.start).getDay()
    counts[dayOfWeek] = (counts[dayOfWeek] || 0) + 1
  })
  return counts
}

const countBookingHours = (events: any[]) => {
  const counts: { [key: number]: number } = {}
  events.forEach(event => {
    const hour = new Date(event.start).getHours()
    counts[hour] = (counts[hour] || 0) + 1
  })
  return counts
}

// Watch for period changes
watch(selectedPeriod, () => {
  loadAnalyticsData()
})

// Load data on mount
onMounted(async () => {
  await loadAnalyticsData()
})

// Set page title
useSeoMeta({ title: () => `Analytics | ${vendor.value?.vendor_name || 'Vendor'}` })
</script>

<style scoped>
.analytics-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.analytics-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.analytics-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

