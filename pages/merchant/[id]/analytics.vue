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
            View analytics for {{ merchant?.name || 'your business' }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Dropdown 
            v-model="selectedPeriod" 
            :options="periodOptions" 
            option-label="label"
            option-value="value"
            placeholder="Select Period"
            class="w-40"
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
              <p class="text-text-muted text-sm font-medium">Total Events</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.totalEvents }}</p>
              <p class="text-green-500 text-sm mt-1">
                <i class="pi pi-arrow-up mr-1"></i>
                +{{ metrics.eventsGrowth }}% vs last period
              </p>
            </div>
            <div class="analytics-icon bg-blue-100 dark:bg-blue-900">
              <i class="pi pi-calendar text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Total Revenue</p>
              <p class="text-3xl font-bold text-text-main">${{ metrics.totalRevenue.toLocaleString() }}</p>
              <p class="text-green-500 text-sm mt-1">
                <i class="pi pi-arrow-up mr-1"></i>
                +{{ metrics.revenueGrowth }}% vs last period
              </p>
            </div>
            <div class="analytics-icon bg-green-100 dark:bg-green-900">
              <i class="pi pi-dollar text-green-600 dark:text-green-400"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Avg Event Value</p>
              <p class="text-3xl font-bold text-text-main">${{ metrics.avgEventValue }}</p>
              <p class="text-blue-500 text-sm mt-1">
                <i class="pi pi-chart-line mr-1"></i>
                {{ metrics.eventValueTrend }}
              </p>
            </div>
            <div class="analytics-icon bg-purple-100 dark:bg-purple-900">
              <i class="pi pi-chart-bar text-purple-600 dark:text-purple-400"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Vendor Rating</p>
              <p class="text-3xl font-bold text-text-main">{{ metrics.avgVendorRating }}</p>
              <div class="flex items-center mt-1">
                <Rating v-model="metrics.avgVendorRating" readonly :cancel="false" />
                <span class="text-text-muted text-sm ml-2">({{ metrics.totalReviews }} reviews)</span>
              </div>
            </div>
            <div class="analytics-icon bg-yellow-100 dark:bg-yellow-900">
              <i class="pi pi-star text-yellow-600 dark:text-yellow-400"></i>
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
          <h3 class="text-xl font-semibold">Events Over Time</h3>
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

      <!-- Top Vendors -->
      <Card>
        <template #title>
          <h3 class="text-xl font-semibold">Top Performing Vendors</h3>
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

    <!-- Detailed Metrics Table -->
    <Card>
      <template #title>
        <h3 class="text-xl font-semibold">Monthly Breakdown</h3>
      </template>
      <template #content>
        <DataTable 
          :value="monthlyData" 
          :paginator="true" 
          :rows="5"
          striped-rows
          class="p-datatable-sm"
        >
          <Column field="month" header="Month" sortable></Column>
          <Column field="events" header="Events" sortable></Column>
          <Column field="revenue" header="Revenue" sortable>
            <template #body="slotProps">
              ${{ slotProps.data.revenue.toLocaleString() }}
            </template>
          </Column>
          <Column field="avgValue" header="Avg Event Value" sortable>
            <template #body="slotProps">
              ${{ slotProps.data.avgValue }}
            </template>
          </Column>
          <Column field="completionRate" header="Completion Rate" sortable>
            <template #body="slotProps">
              {{ slotProps.data.completionRate }}%
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Line, Bar, Doughnut } from 'vue-chartjs'
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
const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))
const supabase = useSupabaseClient()

// Period selection
const selectedPeriod = ref('30d')
const periodOptions = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Last Year', value: '1y' }
]

// Analytics data
const metrics = ref({
  totalEvents: 0,
  eventsGrowth: 0,
  totalRevenue: 0,
  revenueGrowth: 0,
  avgEventValue: 0,
  eventValueTrend: 'Stable',
  avgVendorRating: 0,
  totalReviews: 0
})

// Chart data
const eventsChartData = ref<any>(null)
const revenueChartData = ref<any>(null)
const statusChartData = ref<any>(null)
const vendorsChartData = ref<any>(null)
const monthlyData = ref<any[]>([])

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#9ca3af' // text-muted color
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#9ca3af'
      },
      grid: {
        color: '#374151' // dark mode grid
      }
    },
    y: {
      ticks: {
        color: '#9ca3af'
      },
      grid: {
        color: '#374151'
      }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#9ca3af'
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
    // Get events for this merchant
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('merchant', route.params.id)
      .order('created_at', { ascending: true })

    if (events) {
      await processAnalyticsData(events)
    }
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

// Process analytics data
const processAnalyticsData = async (events: any[]) => {
  const now = new Date()
  const periodStart = getPeriodStart(selectedPeriod.value)
  
  // Filter events by period
  const periodEvents = events.filter(event => 
    new Date(event.created_at) >= periodStart
  )

  // Calculate metrics
  metrics.value.totalEvents = periodEvents.length
  metrics.value.totalRevenue = periodEvents.reduce((sum, event) => 
    sum + (event.event_value || 0), 0
  )
  metrics.value.avgEventValue = periodEvents.length > 0 
    ? Math.round(metrics.value.totalRevenue / periodEvents.length)
    : 0

  // Calculate growth (mock data for now)
  metrics.value.eventsGrowth = 15
  metrics.value.revenueGrowth = 23
  metrics.value.avgVendorRating = 4.2
  metrics.value.totalReviews = 18

  // Generate chart data
  generateChartData(periodEvents)
  generateMonthlyData(events)
}

// Generate chart data
const generateChartData = (events: any[]) => {
  // Events over time
  const eventsByDate = groupEventsByDate(events)
  eventsChartData.value = {
    labels: Object.keys(eventsByDate),
    datasets: [{
      label: 'Events',
      data: Object.values(eventsByDate),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  // Revenue chart
  const revenueByDate = groupRevenueByDate(events)
  revenueChartData.value = {
    labels: Object.keys(revenueByDate),
    datasets: [{
      label: 'Revenue',
      data: Object.values(revenueByDate),
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      borderWidth: 1
    }]
  }

  // Status distribution
  const statusCounts = countEventStatuses(events)
  statusChartData.value = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // yellow
        '#ef4444', // red
        '#6b7280'  // gray
      ]
    }]
  }

  // Top vendors (mock data)
  vendorsChartData.value = {
    labels: ['Taco Truck', 'Pizza Place', 'BBQ Joint', 'Ice Cream', 'Burger Co'],
    datasets: [{
      label: 'Events',
      data: [12, 8, 6, 5, 4],
      backgroundColor: '#8b5cf6'
    }]
  }
}

// Helper functions
const getPeriodStart = (period: string) => {
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

const groupEventsByDate = (events: any[]) => {
  const grouped: { [key: string]: number } = {}
  events.forEach(event => {
    const date = new Date(event.created_at).toLocaleDateString()
    grouped[date] = (grouped[date] || 0) + 1
  })
  return grouped
}

const groupRevenueByDate = (events: any[]) => {
  const grouped: { [key: string]: number } = {}
  events.forEach(event => {
    const date = new Date(event.created_at).toLocaleDateString()
    grouped[date] = (grouped[date] || 0) + (event.event_value || 0)
  })
  return grouped
}

const countEventStatuses = (events: any[]) => {
  const counts: { [key: string]: number } = {}
  events.forEach(event => {
    counts[event.status] = (counts[event.status] || 0) + 1
  })
  return counts
}

const generateMonthlyData = (events: any[]) => {
  // Generate mock monthly data
  monthlyData.value = [
    { month: 'January', events: 8, revenue: 2400, avgValue: 300, completionRate: 95 },
    { month: 'February', events: 12, revenue: 3600, avgValue: 300, completionRate: 92 },
    { month: 'March', events: 15, revenue: 4500, avgValue: 300, completionRate: 88 },
    { month: 'April', events: 10, revenue: 3200, avgValue: 320, completionRate: 90 },
    { month: 'May', events: 18, revenue: 5400, avgValue: 300, completionRate: 94 },
    { month: 'June', events: 22, revenue: 6600, avgValue: 300, completionRate: 91 }
  ]
}

// Watch for period changes
watch(selectedPeriod, () => {
  loadAnalyticsData()
})

// Load data on mount
onMounted(() => {
  loadAnalyticsData()
})

// Set page title
useSeoMeta({ title: () => `${merchant.value?.name || 'Merchant'} Analytics` })
</script>

<style scoped>
.analytics-card {
  @apply bg-white/5 backdrop-blur border border-white/10;
}

.analytics-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
}
</style>