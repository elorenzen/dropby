<template>
  <div class="min-h-screen bg-background p-4 sm:p-6">
    <!-- Loading State -->
    <PageSkeleton v-if="loading" :show-stats="true" :show-list="false" />

    <div v-else>
    <!-- Header Section -->
    <div class="mb-6 sm:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-text-main mb-2">
            Analytics
          </h1>
          <p class="text-text-muted text-base sm:text-lg">
            View analytics for {{ merchant?.name || 'your business' }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Select 
            v-model="selectedPeriod" 
            :options="periodOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select Period"
            class="w-full sm:w-56"
          />
          <Button 
            icon="pi pi-arrow-left" 
            @click="navigateToDashboard"
            outlined 
            label="Back to Dashboard"
            class="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <Card class="analytics-card">
        <template #content>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-text-muted text-sm font-medium">Conversion Rate</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.conversionRate }}%</p>
              <p class="text-success text-sm mt-1">
                <i class="pi pi-check-circle mr-1"></i>
                {{ metrics.totalBookings }} of {{ metrics.totalRequests }} booked & completed events
              </p>
            </div>
            <div class="analytics-icon bg-success-light">
              <i class="pi pi-check text-success text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-text-muted text-sm font-medium">Food Truck Partners</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.uniqueVendors }}</p>
              <p class="text-accent text-sm mt-1">
                <i class="pi pi-users mr-1"></i>
                {{ metrics.repeatVendors }} repeat partners
              </p>
            </div>
            <div class="analytics-icon bg-accent-light">
              <i class="pi pi-truck text-accent text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-text-muted text-sm font-medium">Average Vendor Rating</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.avgVendorRating.toFixed(1) }}</p>
              <p class="text-warning text-sm mt-1">
                <i class="pi pi-star-fill mr-1"></i>
                {{ metrics.totalReviews }} rated events
              </p>
            </div>
            <div class="analytics-icon bg-warning-light">
              <i class="pi pi-star text-warning text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-text-muted text-sm font-medium">Open Demand</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.openEvents }}</p>
              <p class="text-primary text-sm mt-1">
                <i class="pi pi-chart-line mr-1"></i>
                Slots still open in selected period
              </p>
            </div>
            <div class="analytics-icon bg-primary-light">
              <i class="pi pi-clock text-primary text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
      <!-- Events Over Time Chart -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold">Events {{ selectedPeriodLabel }}</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Line 
              :data="eventsChartData" 
              :options="chartOptions"
              v-if="eventsChartData"
            />
          </div>
        </template>
      </Card>

      <!-- COMMENTED OUT - Revenue trend under reconsideration
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold">Revenue Trends</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Bar 
              :data="revenueChartData" 
              :options="chartOptions"
              v-if="revenueChartData"
            />
          </div>
        </template>
      </Card>
      -->

      <!-- Peak Booking Days -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold">Peak Booking Days</h3>
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

      <!-- Favorite Food Trucks -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold">Favorite Food Trucks</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Bar 
              :data="vendorsChartData" 
              :options="horizontalChartOptions"
              v-if="vendorsChartData"
            />
          </div>
        </template>
      </Card>

      <!-- New vs Repeat Vendor Trend -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold">New vs Repeat Vendor Trend</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Bar
              :data="newVsRepeatVendorsChartData"
              :options="stackedChartOptions"
              v-if="newVsRepeatVendorsChartData"
            />
          </div>
        </template>
      </Card>
    </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { Line, Bar } from 'vue-chartjs'
import PageSkeleton from '~/components/skeleton/PageSkeleton.vue'
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
import { generateTimeSeries } from '~/utils/timeSeries'
import { countEventsByDayOfWeek } from '~/utils/analytics'
import { getDateFormatter, getPeriodInterval, getPeriodStart, getStartOfMonth, getStartOfWeek, getStartOfYear } from '~/utils/dates'

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
const merchantStore = useMerchantStore()
const vendorStore = useVendorStore()
const eventStore = useEventStore()
const merchantId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const merchant = ref<any>(await merchantStore.getMerchantById(merchantId))

// Helper function to get CSS variable value
const getCSSVariable = (variableName: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
  }
  // Fallback values for SSR
  const fallbacks: { [key: string]: string } = {
    '--primary-color': '#0891B2',
    '--success-color': '#10B981',
    '--accent-color': '#CA8A04',
    '--warning-color': '#F97316',
    '--error-color': '#EF4444',
    '--text-color': '#f5f6fa',
    '--text-color-secondary': '#b0b3b8',
    '--surface-border': '#33343a'
  }
  return fallbacks[variableName] || '#000000'
}

// Helper function to convert hex to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Loading state
const loading = ref(true)

// Period selection
const selectedPeriod = ref('30d')
const periodOptions = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Last Year', value: '1y' }
]

// Computed property for period label
const selectedPeriodLabel = computed(() => {
  const option = periodOptions.find(opt => opt.value === selectedPeriod.value)
  return option ? option.label : 'Over Time'
})

// Analytics data
const metrics = ref({
  conversionRate: 0,
  totalBookings: 0,
  totalRequests: 0,
  uniqueVendors: 0,
  repeatVendors: 0,
  avgVendorRating: 0,
  totalReviews: 0,
  openEvents: 0
})

// Chart data
const eventsChartData = ref<any>(null)
const revenueChartData = ref<any>(null)
const vendorsChartData = ref<any>(null)
const peakDaysChartData = ref<any>(null)
const newVsRepeatVendorsChartData = ref<any>(null)

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

const stackedChartOptions = {
  ...chartOptions,
  scales: {
    x: {
      ...(chartOptions.scales?.x || {}),
      stacked: true
    },
    y: {
      ...(chartOptions.scales?.y || {}),
      stacked: true
    }
  }
}

// Navigation
const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}

// Load analytics data
const loadAnalyticsData = async () => {
  try {
    // Ensure merchant is available on hard refresh before analytics load
    if (!merchant.value) {
      if (merchantStore.getAllMerchants.length === 0) {
        await merchantStore.loadMerchants()
      }
      merchant.value = await merchantStore.getMerchantById(merchantId)
    }

    const analyticsResult = await merchantStore.getAnalyticsMetrics(merchantId, selectedPeriod.value)

    // Update metrics
    metrics.value.conversionRate = analyticsResult.metrics.conversionRate
    metrics.value.totalBookings = analyticsResult.metrics.totalBookings
    metrics.value.totalRequests = analyticsResult.metrics.totalRequests
    metrics.value.uniqueVendors = analyticsResult.metrics.uniqueVendors
    metrics.value.repeatVendors = analyticsResult.metrics.repeatVendors
    metrics.value.avgVendorRating = analyticsResult.metrics.avgVendorRating
    metrics.value.totalReviews = analyticsResult.metrics.totalReviews
    metrics.value.openEvents = analyticsResult.metrics.openEvents

    // Generate chart data
    await generateChartData(analyticsResult.periodEvents, analyticsResult.vendorCounts)
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

// Generate chart data
const generateChartData = async (events: any[], vendorCounts?: { [key: string]: number }) => {
  // Events over time - generate continuous time series
  const eventsTimeSeries = generateTimeSeries(events, selectedPeriod.value, 'start')
  eventsChartData.value = {
    labels: eventsTimeSeries.labels,
    datasets: [{
      label: 'Events',
      data: eventsTimeSeries.data,
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

  // Revenue trend - COMMENTED OUT - under reconsideration
  // const revenueSeries = buildSummedSeriesByPeriod(events, selectedPeriod.value, (event: any) => event.event_value || 0)
  // revenueChartData.value = {
  //   labels: revenueSeries.labels,
  //   datasets: [{
  //     label: 'Revenue',
  //     data: revenueSeries.data,
  //     borderColor: '#10b981',
  //     backgroundColor: 'rgba(16, 185, 129, 0.2)',
  //     fill: true,
  //     tension: 0.4,
  //     pointBackgroundColor: '#10b981',
  //     pointBorderColor: '#fff',
  //     pointBorderWidth: 2,
  //     pointRadius: 4
  //   }]
  // }

  // Peak booking days should align with booking metrics (booked + completed only)
  const bookedCompletedEvents = events.filter((event: any) =>
    event.status === 'booked' || event.status === 'completed'
  )
  const dayCounts = countEventsByDayOfWeek(bookedCompletedEvents, 'start')
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
      label: '',
      data: dayLabels.map((_, index) => dayCounts[index] || 0),
      backgroundColor: dayColors,
      borderColor: dayColors.map(c => c.replace('0.8', '1')),
      borderWidth: 2
    }]
  }

  // Favorite Food Trucks - use vendorCounts from store if provided, otherwise calculate
  let vendorCountsToUse = vendorCounts || {}
  
  // If vendorCounts not provided, calculate from events
  if (!vendorCounts || Object.keys(vendorCounts).length === 0) {
    const bookedCompletedEvents = events.filter((event: any) => 
      event.status === 'completed' || event.status === 'booked'
    )
    
    vendorCountsToUse = {}
    bookedCompletedEvents.forEach((event: any) => {
      if (event.vendor) {
        vendorCountsToUse[event.vendor] = (vendorCountsToUse[event.vendor] || 0) + 1
      }
    })
  }
  
  // Sort vendors by count and get top 5
  const sortedVendors = Object.entries(vendorCountsToUse)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  
  // Load vendors if not already loaded
  if (vendorStore.getAllVendors.length === 0) {
    await vendorStore.loadVendors()
  }
  
  // Get vendor names
  const vendorNames = sortedVendors.map(([id]) => {
    const vendor = vendorStore.getAllVendors.find((v: any) => v.id === id)
    return vendor?.vendor_name || `Vendor ${id.slice(0, 8)}`
  })
  
  // Generate colors for vendors using theme colors
  const primaryColor = getCSSVariable('--primary-color')
  const successColor = getCSSVariable('--success-color')
  const accentColor = getCSSVariable('--accent-color')
  const vendorColors = [
    hexToRgba(primaryColor, 0.8),      // Primary
    hexToRgba(successColor, 0.8),      // Success
    hexToRgba(accentColor, 0.8),       // Accent
    hexToRgba('#8b5cf6', 0.8),        // Purple (no theme var, keep as is)
    hexToRgba('#ec4899', 0.8)         // Pink (no theme var, keep as is)
  ]
  
  vendorsChartData.value = {
    labels: vendorNames,
    datasets: [{
      label: 'Bookings',
      data: sortedVendors.map(([, count]) => count),
      backgroundColor: vendorColors.slice(0, sortedVendors.length),
      borderColor: vendorColors.slice(0, sortedVendors.length).map(c => c.replace('0.8', '1')),
      borderWidth: 2
    }]
  }

  // New vs repeat vendor trend (booked/completed events only)
  const vendorTrend = buildNewVsRepeatPartnerTrend(bookedCompletedEvents, selectedPeriod.value, 'vendor')
  newVsRepeatVendorsChartData.value = {
    labels: vendorTrend.labels,
    datasets: [
      {
        label: 'New Vendors',
        data: vendorTrend.newCounts,
        backgroundColor: 'rgba(8, 145, 178, 0.75)',
        borderColor: '#0891B2',
        borderWidth: 1
      },
      {
        label: 'Repeat Vendors',
        data: vendorTrend.repeatCounts,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1
      }
    ]
  }
}

const getBucketKey = (date: Date, period: string): string => {
  const interval = getPeriodInterval(period)
  const formatter = getDateFormatter(interval)
  if (interval === 'weekly' || interval === 'biweekly') {
    return formatter(getStartOfWeek(date))
  }
  if (interval === 'monthly') {
    return formatter(getStartOfMonth(date))
  }
  if (interval === 'yearly') {
    return formatter(getStartOfYear(date))
  }
  return formatter(date)
}

const buildSummedSeriesByPeriod = (
  events: any[],
  period: string,
  valueGetter: (event: any) => number
) => {
  const baseline = generateTimeSeries(events, period, 'start')
  const sumsByLabel = baseline.labels.reduce((acc: Record<string, number>, label: string) => {
    acc[label] = 0
    return acc
  }, {})

  const periodStart = getPeriodStart(period)
  events.forEach((event: any) => {
    const startDate = new Date(event.start)
    if (startDate < periodStart) return
    const label = getBucketKey(startDate, period)
    if (sumsByLabel[label] !== undefined) {
      sumsByLabel[label] += valueGetter(event)
    }
  })

  return {
    labels: baseline.labels,
    data: baseline.labels.map((label: string) => Math.round((sumsByLabel[label] || 0) * 100) / 100)
  }
}

const buildNewVsRepeatPartnerTrend = (
  events: any[],
  period: string,
  partnerField: 'vendor' | 'merchant'
) => {
  const baseline = generateTimeSeries(events, period, 'start')
  const newByLabel = baseline.labels.reduce((acc: Record<string, number>, label: string) => {
    acc[label] = 0
    return acc
  }, {})
  const repeatByLabel = baseline.labels.reduce((acc: Record<string, number>, label: string) => {
    acc[label] = 0
    return acc
  }, {})

  const periodStart = getPeriodStart(period)
  const seenPartners = new Set<string>()
  const ordered = [...events]
    .filter((event: any) => {
      const date = new Date(event.start)
      return date >= periodStart
    })
    .sort((a: any, b: any) => Date.parse(a.start) - Date.parse(b.start))

  ordered.forEach((event: any) => {
    const partnerId = event[partnerField]
    if (!partnerId) return
    const label = getBucketKey(new Date(event.start), period)
    if (newByLabel[label] === undefined) return

    if (seenPartners.has(partnerId)) {
      repeatByLabel[label] += 1
      return
    }

    seenPartners.add(partnerId)
    newByLabel[label] += 1
  })

  return {
    labels: baseline.labels,
    newCounts: baseline.labels.map((label: string) => newByLabel[label] || 0),
    repeatCounts: baseline.labels.map((label: string) => repeatByLabel[label] || 0)
  }
}


// Watch for period changes
watch(selectedPeriod, async () => {
  loading.value = true
  await loadAnalyticsData()
  loading.value = false
})

// Load data on mount
onMounted(async () => {
  if (eventStore.allEvents.length === 0) {
    await eventStore.loadEvents()
  }
  await loadAnalyticsData()
  loading.value = false
})

// Set page title
useSeoMeta({ title: () => `Analytics | ${merchant.value?.merchant_name || 'Merchant'}` })
</script>

<style scoped>
.analytics-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.analytics-icon {
  width: 3rem;
  height: 3rem;
  min-width: 3rem;
  min-height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .analytics-card :deep(.p-card-content) {
    padding: 0.75rem !important;
  }

  .analytics-card .text-3xl {
    font-size: 1.5rem;
  }

  .analytics-icon {
    width: 2.75rem;
    height: 2.75rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
  }

  .analytics-card:hover {
    transform: none;
  }
}
</style>