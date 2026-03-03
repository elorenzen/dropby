<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Loading State -->
    <PageSkeleton v-if="loading" :show-stats="true" :show-list="false" />

    <div v-else>
    <!-- Trial Expired Alert -->
    <div v-if="trialExpired && !trialAlertDismissed" class="rounded-lg p-4 mb-6 flex items-start gap-3" style="background: var(--p-red-50, #fef2f2); border: 1px solid var(--p-red-200, #fecaca);">
      <i class="pi pi-exclamation-triangle text-xl mt-0.5" style="color: var(--p-red-500, #ef4444);"></i>
      <div class="flex-1">
        <h4 class="font-semibold mb-1" style="color: var(--p-red-700, #b91c1c);">Your free trial has ended</h4>
        <p class="text-sm mb-3" style="color: var(--p-red-600, #dc2626);">
          Add a payment method in Settings to continue your paid plan, or your account will be downgraded to the free plan.
        </p>
        <div class="flex gap-2">
          <Button label="Go to Payment Settings" icon="pi pi-credit-card" size="small" severity="danger" @click="navigateToFinancials" />
          <Button label="Dismiss" size="small" text @click="trialAlertDismissed = true" />
        </div>
      </div>
    </div>

    <!-- Trial Active Banner -->
    <div v-if="isTrialing" class="rounded-lg p-4 mb-6 flex items-start gap-3" style="background: var(--p-blue-50, #eff6ff); border: 1px solid var(--p-blue-200, #bfdbfe);">
      <i class="pi pi-clock text-xl mt-0.5" style="color: var(--p-blue-500, #3b82f6);"></i>
      <div class="flex-1">
        <p class="text-sm font-medium" style="color: var(--p-blue-700, #1d4ed8);">
          Free trial active — {{ trialDaysRemaining }} day{{ trialDaysRemaining !== 1 ? 's' : '' }} remaining.
          <NuxtLink :to="`/settings/${route.params.id}/?activeTab=4`" class="underline">Add a payment method</NuxtLink> to continue after your trial.
        </p>
      </div>
    </div>

    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Welcome back, {{ user?.first_name || 'Vendor' }}!
          </h1>
          <p class="text-text-muted text-lg">
            Here's what's happening with {{ vendor?.vendor_name || 'your food truck' }} today
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Button 
            icon="pi pi-arrow-left" 
            @click="navigateToEvents"
            outlined 
            label="View Events"
          />
        </div>
      </div>
    </div>

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="analytics-card clickable-card" @click="navigateToEvents">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Total Events</p>
              <p class="text-3xl font-bold text-text-main">{{ analytics.totalEvents }}</p>
              <p class="text-success text-sm mt-1">
                <i class="pi pi-arrow-up mr-1"></i>
                +{{ analytics.eventsGrowth }}% this month
              </p>
            </div>
            <div class="analytics-icon bg-primary-light">
              <i class="pi pi-calendar icon-primary"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card clickable-card" @click="navigateToEvents">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Upcoming Events</p>
              <p class="text-3xl font-bold text-text-main">{{ analytics.upcomingEvents }}</p>
              <p class="text-primary-dark text-sm mt-1">
                <i class="pi pi-clock mr-1"></i>
                {{ analytics.upcomingWeek }} in next 7 days
              </p>
            </div>
            <div class="analytics-icon bg-success-light">
              <i class="pi pi-check-circle icon-success"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card clickable-card" @click="navigateToEvents">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Pending Requests</p>
              <p class="text-3xl font-bold text-text-main">{{ analytics.pendingRequests }}</p>
              <p class="text-accent text-sm mt-1">
                <i class="pi pi-clock mr-1"></i>
                Awaiting approval
              </p>
            </div>
            <div class="analytics-icon bg-accent-light">
              <i class="pi pi-clock text-accent"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="analytics-card clickable-card" @click="navigateToRatings">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Avg. Rating</p>
              <p class="text-3xl font-bold text-text-main">{{ analytics.averageRating }}</p>
              <div class="flex items-center mt-1">
                <Rating v-model="analytics.averageRating" readonly :cancel="false" />
                <span class="text-text-muted text-sm ml-2">({{ analytics.totalRatings }} reviews)</span>
              </div>
            </div>
            <div class="analytics-icon bg-accent-light">
              <i class="pi pi-star text-accent"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- Usage Tracking Card - Only show for non-premium plans -->
      <Card v-if="!isPremiumPlan" class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Event Requests</p>
              <p class="text-3xl font-bold text-text-main">{{ usage.currentRequests }}/{{ usage.maxRequests }}</p>
              <div class="flex items-center mt-1">
                <ProgressBar 
                  :value="(usage.currentRequests / usage.maxRequests) * 100" 
                  :show-value="false"
                  class="flex-1 mr-2"
                  :class="usage.currentRequests >= usage.maxRequests ? 'bg-error-light' : 'bg-success-light'"
                />
                <span class="text-text-muted text-sm">{{ usage.remainingRequests }} left</span>
              </div>
              <Button 
                v-if="usage.currentRequests >= usage.maxRequests"
                @click="navigateToFinancials"
                label="Upgrade Plan"
                severity="warning"
                size="small"
                class="mt-2"
              />
            </div>
            <div class="analytics-icon bg-accent-light">
              <i class="pi pi-send icon-accent"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column - Calendar & Events -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Calendar Section -->
        <Card>
            <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold">Event Calendar</h3>
              <div class="flex items-center gap-2">
                <Button 
                  label="Today" 
                  size="small" 
                  outlined 
                  @click="goToToday"
                />
                <Button 
                  label="Find Events" 
                  size="small" 
                  icon="pi pi-search"
                  @click="navigateToEvents"
                />
              </div>
            </div>
          </template>
          <template #content>
            <EventCalendar 
              user-type="vendor" 
              :vendor="vendor || {}" 
            />
          </template>
        </Card>
      </div>

      <!-- Right Column - Quick Actions & Activity -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <QuickActions user-type="vendor" />
        
        <!-- Recent Activity -->
        <Card>
          <template #title>
            <h3 class="text-xl font-semibold">Recent Activity</h3>
          </template>
          <template #content>
            <div class="space-y-4">
              <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3">
                <div class="activity-icon" :class="activity.iconClass">
                  <i :class="activity.icon"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-text-main">{{ activity.title }}</p>
                  <p class="text-xs text-text-muted">{{ activity.description }}</p>
                  <p class="text-xs text-text-muted mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Performance Chart -->
        <Card>
          <template #title>
            <h3 class="text-xl font-semibold">Monthly Performance</h3>
          </template>
          <template #content>
            <div class="h-48 flex items-center justify-center">
              <div class="text-center">
                <i class="pi pi-chart-line text-4xl text-accent mb-2"></i>
                <p class="text-text-muted">Chart coming soon</p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
      </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

import type { User, Vendor } from '~/types'

const supabase = useSupabaseClient()
const userStore = useUserStore()
const vendorStore = useVendorStore()
const merchantStore = useMerchantStore()
const eventStore = useEventStore()
const route = useRoute()

const user = ref<User | null>(userStore.user as User | null)
const vendor = ref<Vendor | null>((await vendorStore.getVendorById(user.value?.associated_vendor_id || '')) as unknown as Vendor | null)
const subscriptionStore = useSubscriptionStore()

// Load timeline data
const timelineStore = useTimelineStore()
await timelineStore.loadTimeline(route.params.id as string)

// Load review data
const reviewStore = useReviewStore()
await reviewStore.loadReviewsForBusiness(route.params.id as string, 'vendor')

await subscriptionStore.setActiveSubscription(route.params.id as string, 'vendor')
const activeSubscription = subscriptionStore.getActiveSubscription

// Trial state
const trialAlertDismissed = ref(false)
const isTrialing = computed(() => subscriptionStore.isTrialing)
const trialExpired = computed(() => subscriptionStore.trialExpired)
const trialDaysRemaining = computed(() => {
  const trialEnd = subscriptionStore.trialEndDate
  if (!trialEnd) return null
  const now = new Date()
  const end = new Date(trialEnd)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

useSeoMeta({ title: () => `Dashboard | ${vendor.value?.vendor_name || 'Vendor'}` })

const refreshKey = ref(0)
const allEvents = ref(eventStore.getAllOpenEvents)
const bookedEvents = ref(await eventStore.getBookedEventsByVendorId(vendor.value?.id || ''))
const pendingEvents = ref(await eventStore.getPendingEventsByVendorId(vendor.value?.id || ''))
const loading = ref(true)

// Analytics data - initialize with received reviews data
const receivedReviewsData = reviewStore.getReceivedReviews
const initialAverageRating = receivedReviewsData.length > 0
  ? Math.round((receivedReviewsData.reduce((sum: number, review: any) => sum + review.rating, 0) / receivedReviewsData.length) * 10) / 10
  : 0

const analytics = ref({
  totalEvents: 0,
  eventsGrowth: 0,
  upcomingEvents: 0,
  upcomingWeek: 0,
  pendingRequests: 0,
  averageRating: initialAverageRating,
  totalRatings: receivedReviewsData.length
})

// Usage tracking data
const usage = ref({
  currentRequests: 0,
  maxRequests: 5,
  remainingRequests: 5
})

// Subscription data
const subscription = ref<any>(null)

// Computed property to determine if plan is premium (unlimited requests)
const isPremiumPlan = computed(() => {
  if (!subscription.value) return false
  const premiumPlans = ['pro', 'premium']
  return premiumPlans.includes(subscription.value.planType)
})

// Helper function to format time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

// Helper function to get merchant properties
const getMerchantProp = (merchantId: string, prop: string): string => {
  return merchantStore.getMerchantProp(merchantId, prop)
}

// Recent activity data - now computed from timeline with fallback
const { getTimelineConfig } = useTimelineIcons()
const recentActivity = computed(() => {
  // If we have timeline items, use them
  if (timelineItems.value.length > 0) {
    return timelineItems.value.slice(0, 4).map((item: any) => {
      const timeAgo = getTimeAgo(new Date(item.created_at))
      
      // Get icon and color from composable based on timeline item type
      const config = getTimelineConfig(item.type)
      
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        time: timeAgo,
        icon: `pi ${config.icon}`,
        iconClass: config.colorClass
      }
    })
  }
  
  // Fallback activity based on vendor's events and reviews
  const fallbackActivity = []
  
  // Add activity for recent events
  const recentEvents = events.value.slice(0, 2)
  recentEvents.forEach((event: any, index: number) => {
    const eventDate = new Date(event.start)
    const timeAgo = getTimeAgo(eventDate)
    
    let title = ''
    let description = ''
    let icon = 'pi pi-calendar'
    let iconClass = 'bg-primary-light text-primary-dark'
    
    if (event.status === 'booked') {
      title = 'Event Confirmed'
      description = `Event confirmed for ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}`
      icon = 'pi pi-check-circle'
      iconClass = 'bg-success-light text-success-dark'
    } else if (event.status === 'open' && event.pending_requests?.includes(vendor.value?.id)) {
      title = 'Event Request Sent'
      description = `Request sent for event on ${eventDate.toLocaleDateString()}`
      icon = 'pi pi-send'
      iconClass = 'bg-accent-light text-accent-dark'
    }
    
    if (title) {
      fallbackActivity.push({
        id: `event-${event.id}`,
        title,
        description,
        time: timeAgo,
        icon,
        iconClass
      })
    }
  })
  
  // Add activity for recent reviews
  const receivedReviewsData = reviewStore.getReceivedReviews
  if (receivedReviewsData.length > 0) {
    const latestReview = receivedReviewsData[0]
    const merchantName = getMerchantProp(latestReview.sender_id || '', 'merchant_name')
    fallbackActivity.push({
      id: `review-${latestReview.id}`,
      title: 'New Rating Received',
      description: `${latestReview.rating} stars from ${merchantName || 'Establishment'}`,
      time: getTimeAgo(new Date(latestReview.created_at)),
      icon: 'pi pi-star',
      iconClass: 'bg-accent-light text-accent-dark'
    })
  }
  
  // Add welcome activity if no other activity
  if (fallbackActivity.length === 0) {
    fallbackActivity.push({
      id: 'welcome',
      title: 'Welcome to DropBy!',
      description: 'Start by browsing available events or updating your profile',
      time: 'Just now',
      icon: 'pi pi-info-circle',
      iconClass: 'bg-primary-light text-primary-dark'
    })
  }
  
  return fallbackActivity.slice(0, 4)
})

const timelineItems = computed(() => {
  return timelineStore.getTimeline || []
})

const events = computed(() => {
    return eventStore.allEvents
      .filter((e: any) => e.vendor === vendor.value?.id)
    .sort((a: any, b: any) => Date.parse(b.start) - Date.parse(a.start))
  })

const allBookedDates = computed(() => {
  const allBookedEvents = events.value.filter((e: any) => e.status === 'booked')
  return allBookedEvents.map((e: any) => new Date(e.start))
  })

const attributes = ref([
    {
      highlight: {
        color: 'orange',
        fillMode: 'outline'
      },
      dates: new Date(),
    },
    {
      highlight: {
          color: 'green',
          fillMode: 'light',
        },
      dates: allEvents.value
    },
    {
      highlight: {
          color: 'yellow',
          fillMode: 'light',
        },
      dates: pendingEvents.value
    },
    {
      dot: true,
      dates: bookedEvents.value
    }
])

const navigateToSettings = () => {
  navigateTo(`/settings/${route.params.id}`)
}

const navigateToEvents = () => {
  navigateTo(`/vendor/${route.params.id}/events`)
}

const navigateToRatings = () => {
  navigateTo(`/vendor/${route.params.id}/ratings-and-reviews`)
}

const goToToday = () => {
  console.log('Go to today')
}

const loadAnalytics = async () => {
  try {
    if (!vendor.value?.id) return
    
    const analyticsData = await vendorStore.getDashboardMetrics(vendor.value.id)
    
    analytics.value.totalEvents = analyticsData.totalEvents
    analytics.value.eventsGrowth = analyticsData.eventsGrowth
    analytics.value.upcomingEvents = analyticsData.upcomingEvents
    analytics.value.upcomingWeek = analyticsData.upcomingWeek
    analytics.value.pendingRequests = analyticsData.pendingRequests
    analytics.value.averageRating = analyticsData.averageRating
    analytics.value.totalRatings = analyticsData.totalRatings
    
    usage.value = analyticsData.usage
    subscription.value = analyticsData.subscription
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

// Navigation methods
const navigateToFinancials = () => {
  navigateTo(`/settings/${route.params.id}/?activeTab=4`)
}

// Debug timeline data
watchEffect(() => {
  console.log('Timeline items:', timelineItems.value)
})

// Load data on mount
onMounted(async () => {
  await loadAnalytics()
  loading.value = false

  // Subscribe to real-time updates for reviews
  supabase
    .channel('reviews')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'reviews' }, 
      async (payload: any) => {
        // Reload review data when there are changes
        await reviewStore.loadReviewsForBusiness(route.params.id as string, 'vendor')
        
        // Reload analytics to update ratings
        loadAnalytics()
      })
    .subscribe()

  // Subscribe to real-time updates for timeline items
  supabase
    .channel('timeline')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'timeline_items' }, 
      async (payload: any) => {
        // Reload timeline data when there are changes
        await timelineStore.loadTimeline(route.params.id as string)
      })
    .subscribe()
})
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

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.clickable-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--primary-color-rgb), 0.5);
}
</style>