<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Loading State -->
    <PageSkeleton v-if="loading" :show-stats="true" :show-list="false" />

    <div v-else>
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Analytics
          </h1>
          <p class="text-text-muted text-lg">
            View analytics for {{ merchant?.name || 'your business' }}
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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Booking Conversion Rate</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.conversionRate }}%</p>
              <p class="text-success text-sm mt-1">
                <i class="pi pi-check-circle mr-1"></i>
                {{ metrics.totalBookings }} of {{ metrics.totalRequests }} requests booked
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
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Completion Rate</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.completionRate }}%</p>
              <p class="text-success text-sm mt-1">
                <i class="pi pi-check-circle mr-1"></i>
                {{ metrics.completedEvents }} of {{ metrics.totalBookings }} bookings completed
              </p>
            </div>
            <div class="analytics-icon bg-success-light">
              <i class="pi pi-check-circle text-success text-2xl"></i>
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
                Booked & completed events
              </p>
            </div>
            <div class="analytics-icon bg-primary-light">
              <i class="pi pi-calendar text-primary text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
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
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

      <!-- Revenue Chart -->
      <!-- COMMENTED OUT - Feature under consideration (relies on event_value)
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

      <!-- Event Status Distribution -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold">Event Status Distribution</h3>
        </template>
        <template #content>
          <div class="h-80">
            <Doughnut 
              :data="statusChartData" 
              :options="doughnutOptions"
              v-if="statusChartData"
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
    </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { Line, Bar, Doughnut } from 'vue-chartjs'
import PageSkeleton from '~/components/skeleton/PageSkeleton.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  ArcElement,
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
  completionRate: 0,
  completedEvents: 0,
  avgVendorRating: 0,
  totalReviews: 0,
  openEvents: 0
})

// Chart data
const eventsChartData = ref<any>(null)
const revenueChartData = ref<any>(null)
const statusChartData = ref<any>(null)
const vendorsChartData = ref<any>(null)
const peakDaysChartData = ref<any>(null)

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

const doughnutOptions = {
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
  }
}

const horizontalChartOptions = {
  ...chartOptions,
  indexAxis: 'y' as const
}

// Navigation
const navigateToDashboard = () => {
  navigateTo(`/merchant/${route.params.id}/dashboard`)
}

// Load analytics data
const loadAnalyticsData = async () => {
  try {
    // Get all events for this merchant from store
    const allEvents = await eventStore.getEventsByMerchantId(merchantId)
    
    if (!allEvents) return

    const periodStart = getPeriodStart(selectedPeriod.value)

    // Filter events by period - use event start date (when event happened) for filtering
    const periodEvents = selectedPeriod.value === 'all' 
      ? allEvents 
      : allEvents.filter((event: any) => 
          new Date(event.start) >= periodStart
        )

    await processAnalyticsData(periodEvents, allEvents)
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

// Process analytics data
const processAnalyticsData = async (periodEvents: any[], allEvents: any[]) => {
  // Get events with pending requests (requests made)
  const eventsWithRequests = periodEvents.filter(event => 
    event.pending_requests && 
    Array.isArray(event.pending_requests) && 
    event.pending_requests.length > 0
  )
  
  // Count total requests (sum of all pending_requests arrays)
  metrics.value.totalRequests = eventsWithRequests.reduce((sum, event) => 
    sum + (event.pending_requests?.length || 0), 0
  )
  
  // Get booked/completed events
  const bookedEvents = periodEvents.filter(event => 
    event.status === 'booked' || event.status === 'completed'
  )
  metrics.value.totalBookings = bookedEvents.length
  
  // Calculate conversion rate: (booked events / total requests) * 100
  metrics.value.conversionRate = metrics.value.totalRequests > 0
    ? Math.round((metrics.value.totalBookings / metrics.value.totalRequests) * 100)
    : 0
  
  // Calculate completion rate
  const completedEvents = periodEvents.filter(event => event.status === 'completed')
  metrics.value.completedEvents = completedEvents.length
  metrics.value.completionRate = metrics.value.totalBookings > 0
    ? Math.round((metrics.value.completedEvents / metrics.value.totalBookings) * 100)
    : 0
  
  // Calculate vendor relationship metrics
  const vendorIds = bookedEvents
    .map(event => event.vendor)
    .filter((id): id is string => id !== null && id !== undefined)
  
  const uniqueVendorSet = new Set(vendorIds)
  metrics.value.uniqueVendors = uniqueVendorSet.size
  
  // Count repeat vendors (vendors with >1 booking)
  const vendorCounts: { [key: string]: number } = {}
  vendorIds.forEach(id => {
    vendorCounts[id] = (vendorCounts[id] || 0) + 1
  })
  metrics.value.repeatVendors = Object.values(vendorCounts).filter(count => count > 1).length
  
  // Calculate average vendor rating
  const eventsWithRatings = periodEvents.filter(event => 
    event.vendor_rating !== null && event.vendor_rating !== undefined
  )
  if (eventsWithRatings.length > 0) {
    const totalRating = eventsWithRatings.reduce((sum, event) => 
      sum + (event.vendor_rating || 0), 0
    )
    metrics.value.avgVendorRating = Math.round((totalRating / eventsWithRatings.length) * 10) / 10
    metrics.value.totalReviews = eventsWithRatings.length
  } else {
    metrics.value.avgVendorRating = 0
    metrics.value.totalReviews = 0
  }
  
  // Count open events
  metrics.value.openEvents = periodEvents.filter(event => event.status === 'open').length

  // Generate chart data
  await generateChartData(periodEvents)
}

// Generate chart data
const generateChartData = async (events: any[]) => {
  // Events over time - generate continuous time series
  const eventsTimeSeries = generateEventsTimeSeries(events, selectedPeriod.value)
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

  // Revenue chart - COMMENTED OUT - Feature under consideration (relies on event_value)
  // const revenueByDate = groupRevenueByDate(events)
  // revenueChartData.value = {
  //   labels: Object.keys(revenueByDate),
  //   datasets: [{
  //     label: 'Revenue',
  //     data: Object.values(revenueByDate),
  //     backgroundColor: 'rgba(16, 185, 129, 0.7)', // Success green
  //     borderColor: '#10b981',
  //     borderWidth: 2
  //   }]
  // }

  // Status distribution
  const statusCounts = countEventStatuses(events)
  statusChartData.value = {
    labels: Object.keys(statusCounts),
    datasets: [{
      label: '',
      data: Object.values(statusCounts),
      backgroundColor: [
        'rgba(8, 145, 178, 0.8)',   // Primary cyan
        'rgba(16, 185, 129, 0.8)',  // Success green
        'rgba(245, 158, 11, 0.8)',  // Warning yellow
        'rgba(239, 68, 68, 0.8)',   // Error red
        'rgba(156, 163, 175, 0.8)'  // Gray
      ],
      borderColor: [
        '#0891B2',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#9ca3af'
      ],
      borderWidth: 2
    }]
  }

  // Peak booking days
  const dayCounts = countBookingDays(events)
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

  // Favorite Food Trucks - get actual vendor data from booked/completed events
  const bookedCompletedEvents = events.filter(event => 
    event.status === 'completed' || event.status === 'booked'
  )
  
  // Count events per vendor
  const vendorCounts: { [key: string]: number } = {}
  bookedCompletedEvents.forEach(event => {
    if (event.vendor) {
      vendorCounts[event.vendor] = (vendorCounts[event.vendor] || 0) + 1
    }
  })
  
  // Sort vendors by count and get top 5
  const sortedVendors = Object.entries(vendorCounts)
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

// Generate continuous time series for events chart (reusing vendor analytics logic)
const generateEventsTimeSeries = (events: any[], period: string) => {
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

// COMMENTED OUT - Feature under consideration (relies on event_value)
// const groupRevenueByDate = (events: any[]) => {
//   const grouped: { [key: string]: number } = {}
//   events.forEach(event => {
//     const date = new Date(event.created_at).toLocaleDateString()
//     grouped[date] = (grouped[date] || 0) + (event.event_value || 0)
//   })
//   return grouped
// }

const countEventStatuses = (events: any[]) => {
  const counts: { [key: string]: number } = {}
  events.forEach(event => {
    counts[event.status] = (counts[event.status] || 0) + 1
  })
  return counts
}


// Watch for period changes
watch(selectedPeriod, async () => {
  loading.value = true
  await loadAnalyticsData()
  loading.value = false
})

// Load data on mount
onMounted(async () => {
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>