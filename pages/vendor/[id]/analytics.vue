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
            View analytics for {{ vendor?.vendor_name || 'your business' }}
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
import { countEventsByDayOfWeek, countEventsByHour } from '~/utils/analytics'

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
const eventStore = useEventStore()
const vendor = ref<any>(null)
const supabase = useSupabaseClient()

const loading = ref(true)

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
    const analyticsResult = await vendorStore.getAnalyticsMetrics(vendorId, selectedPeriod.value)

    // Update metrics
    metrics.value.totalBookings = analyticsResult.metrics.totalBookings
    metrics.value.pendingRequests = analyticsResult.metrics.pendingRequests
    metrics.value.acceptanceRate = analyticsResult.metrics.acceptanceRate
    metrics.value.uniqueMerchants = analyticsResult.metrics.uniqueMerchants
    metrics.value.repeatMerchants = analyticsResult.metrics.repeatMerchants
    metrics.value.avgBookingsPerMerchant = analyticsResult.metrics.avgBookingsPerMerchant

    // Generate chart data
    await generateChartData(analyticsResult.acceptedEvents, analyticsResult.merchantCounts, analyticsResult.periodEvents, vendorId)
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

// Generate chart data
const generateChartData = async (
  acceptedEvents: any[], 
  merchantCounts: { [key: string]: number },
  allPeriodEvents: any[],
  vendorId: string
) => {
  // Bookings over time - generate continuous time series
  const bookingsTimeSeries = generateTimeSeries(acceptedEvents, selectedPeriod.value, 'start')
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
  const dayCounts = countEventsByDayOfWeek(acceptedEvents, 'start')
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
  const hourCounts = countEventsByHour(acceptedEvents, 'start')
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

