<template>
  <div class="min-h-screen bg-background p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-main mb-2">
            Welcome back, {{ user?.first_name || 'Vendor' }}! 🚚
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
              <p class="text-green-500 text-sm mt-1">
                <i class="pi pi-arrow-up mr-1"></i>
                +{{ analytics.eventsGrowth }}% this month
              </p>
            </div>
            <div class="analytics-icon bg-blue-100 dark:bg-blue-900">
              <i class="pi pi-calendar text-blue-600 dark:text-blue-400"></i>
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
              <p class="text-orange-500 text-sm mt-1">
                <i class="pi pi-clock mr-1"></i>
                {{ analytics.upcomingWeek }} in next 7 days
              </p>
            </div>
            <div class="analytics-icon bg-green-100 dark:bg-green-900">
              <i class="pi pi-check-circle text-green-600 dark:text-green-400"></i>
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
              <p class="text-yellow-500 text-sm mt-1">
                <i class="pi pi-clock mr-1"></i>
                Awaiting approval
              </p>
            </div>
            <div class="analytics-icon bg-yellow-100 dark:bg-yellow-900">
              <i class="pi pi-clock text-yellow-600 dark:text-yellow-400"></i>
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
            <div class="analytics-icon bg-purple-100 dark:bg-purple-900">
              <i class="pi pi-star text-purple-600 dark:text-purple-400"></i>
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
                  :class="usage.currentRequests >= usage.maxRequests ? 'bg-red-200' : 'bg-green-200'"
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
            <div class="analytics-icon bg-orange-100 dark:bg-orange-900">
              <i class="pi pi-send text-orange-600 dark:text-orange-400"></i>
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
            <BaseCalendar :attributes="attributes" :refresh="refreshKey" />
          </template>
        </Card>

        <!-- Recent Events Table -->
        <Card>
            <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold">My Events</h3>
              <Button 
                label="View All" 
                size="small" 
                text 
                @click="navigateToSettings"
              />
            </div>
            </template>
            <template #content>
                <VendorEventTable />
            </template>
        </Card>
      </div>

      <!-- Right Column - Activity & Quick Actions -->
      <div class="space-y-6">
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
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

import type { User, Vendor } from '~/types'

const supabase = useSupabaseClient()
const userStore = useUserStore()
const vendorStore = useVendorStore()
const eventStore = useEventStore()
const route = useRoute()

const user = ref<User | null>(userStore.user as User | null)
const vendor = ref<Vendor | null>((await vendorStore.getVendorById(user.value?.associated_vendor_id || '')) as unknown as Vendor | null)

// Load timeline data
const timelineStore = useTimelineStore()
const { data: timelineData, error: timelineError } = await supabase
  .from('timeline_items')
  .select('*')
  .eq('owner_id', route.params.id)
  .order('created_at', { ascending: false })
await timelineStore.setTimeline(timelineData || [])

// Load review data
const reviewStore = useReviewStore()
const { data: receivedReviews, error: receivedReviewsError } = await supabase
  .from('reviews')
  .select('*')
  .eq('recipient_id', route.params.id)
  .order('created_at', { ascending: false })
await reviewStore.setReceivedReviews(receivedReviews || [])

const { data: sentReviews, error: sentReviewsError } = await supabase
  .from('reviews')
  .select('*')
  .eq('sender_id', route.params.id)
  .order('created_at', { ascending: false })
await reviewStore.setSentReviews(sentReviews || [])

useSeoMeta({ title: () => `Dashboard | ${vendor.value?.vendor_name || 'Vendor'}` })

const refreshKey = ref(0)
const allEvents = ref(eventStore.getAllOpenEvents)
const bookedEvents = ref(await eventStore.getBookedEventsByVendorId(vendor.value?.id || ''))
const pendingEvents = ref(await eventStore.getPendingEventsByVendorId(vendor.value?.id || ''))
const loading = ref(false)

// Analytics data
const analytics = ref({
  totalEvents: 0,
  eventsGrowth: 0,
  upcomingEvents: 0,
  upcomingWeek: 0,
  pendingRequests: 0,
  averageRating: 0,
  totalRatings: 0
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
  const premiumPlans = ['pro', 'premium', 'enterprise']
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
  const merchantStore = useMerchantStore()
  const allMerchants = merchantStore.getAllMerchants
  const merchant = allMerchants.find((m: any) => m.id === merchantId)
  return merchant?.[prop] || ''
}

// Recent activity data - now computed from timeline with fallback
const recentActivity = computed(() => {
  // If we have timeline items, use them
  if (timelineItems.value.length > 0) {
    return timelineItems.value.slice(0, 4).map((item: any) => {
      const timeAgo = getTimeAgo(new Date(item.created_at))
      
      // Determine icon and styling based on timeline item type
      let icon = 'pi pi-info-circle'
      let iconClass = 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
      
      switch (item.type) {
        case 'event_completed':
          icon = 'pi pi-check-circle'
          iconClass = 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
          break
        case 'event':
          icon = 'pi pi-calendar-plus'
          iconClass = 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
          break
        case 'rating':
          icon = 'pi pi-star'
          iconClass = 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
          break
        case 'profile':
          icon = 'pi pi-user-edit'
          iconClass = 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
          break
      }
      
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        time: timeAgo,
        icon,
        iconClass
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
    let iconClass = 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
    
    if (event.status === 'booked') {
      title = 'Event Confirmed'
      description = `Event confirmed for ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}`
      icon = 'pi pi-check-circle'
      iconClass = 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
    } else if (event.status === 'open' && event.pending_requests?.includes(vendor.value?.id)) {
      title = 'Event Request Sent'
      description = `Request sent for event on ${eventDate.toLocaleDateString()}`
      icon = 'pi pi-send'
      iconClass = 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
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
      iconClass: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
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
      iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
    })
  }
  
  return fallbackActivity.slice(0, 4)
})

const timelineItems = computed(() => {
  return timelineStore.getTimeline
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
    // Get events for this vendor
    if (!vendor.value?.id) return
    
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('vendor', vendor.value.id)
    
    if (events) {
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Only count booked events (those with a merchant)
      const bookedEvents = events.filter((e: any) => e.merchant && e.status === 'booked')
      analytics.value.totalEvents = bookedEvents.length
      analytics.value.upcomingEvents = bookedEvents.filter((e: any) => new Date(e.start) > now).length
      
      // Get all events where this vendor has pending requests
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
      
      // Calculate pending requests for future events with open status that have pending requests
      const futureOpenEventsWithRequests = allEvents?.filter((e: any) => 
        e.status === 'open' && 
        new Date(e.start) > now && 
        e.pending_requests && 
        e.pending_requests.includes(vendor.value?.id)
      ) || []
      analytics.value.pendingRequests = futureOpenEventsWithRequests.length
      
      // Calculate upcoming events in next 7 days
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      analytics.value.upcomingWeek = bookedEvents.filter((e: any) => {
        const startDate = new Date(e.start)
        return startDate >= now && startDate <= nextWeek
      }).length
      
      // Calculate events growth (this month vs last month) for booked events only
      const thisMonthEvents = bookedEvents.filter((e: any) => new Date(e.created_at) >= thisMonth).length
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEvents = bookedEvents.filter((e: any) => {
        const created = new Date(e.created_at)
        return created >= lastMonth && created < thisMonth
      }).length
      
      // Calculate growth percentage - handle zero cases
      if (lastMonthEvents === 0) {
        analytics.value.eventsGrowth = thisMonthEvents > 0 ? 100 : 0
      } else {
        analytics.value.eventsGrowth = Math.round(((thisMonthEvents - lastMonthEvents) / lastMonthEvents) * 100)
      }
      
      // Calculate average rating from received reviews
      const receivedReviewsData = reviewStore.getReceivedReviews
      if (receivedReviewsData.length > 0) {
        const totalRating = receivedReviewsData.reduce((sum: number, review: any) => sum + review.rating, 0)
        analytics.value.averageRating = Math.round((totalRating / receivedReviewsData.length) * 10) / 10
        analytics.value.totalRatings = receivedReviewsData.length
      } else {
        analytics.value.averageRating = 0
        analytics.value.totalRatings = 0
      }
    }

    // Load usage data and subscription info
    try {
      const usageCheck = await $fetch('/api/usage/check', {
        method: 'POST',
        body: {
          businessId: route.params.id as string,
          businessType: 'vendor',
          usageType: 'requests',
          requiredAmount: 0
        }
      }) as any

      usage.value.currentRequests = usageCheck.currentUsage || 0
      usage.value.maxRequests = usageCheck.usageLimit || 5
      usage.value.remainingRequests = Math.max(0, usage.value.maxRequests - usage.value.currentRequests)

      subscription.value = usageCheck.subscription || null
    } catch (usageError) {
      console.error('Error loading usage data:', usageError)
      // Set default values if usage check fails
      usage.value.currentRequests = 0
      usage.value.maxRequests = 5
      usage.value.remainingRequests = 5
      subscription.value = null
    }
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
  loadAnalytics()

  // Subscribe to real-time updates for reviews
  supabase
    .channel('reviews')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'reviews' }, 
      async (payload: any) => {
        const { data: newReceivedReviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('recipient_id', route.params.id)
          .order('created_at', { ascending: false })
        await reviewStore.setReceivedReviews(newReceivedReviews || [])
        const { data: newSentReviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('sender_id', route.params.id)
          .order('created_at', { ascending: false })
        await reviewStore.setSentReviews(newSentReviews || [])
        
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
        const { data: newTimelineData } = await supabase
          .from('timeline_items')
          .select('*')
          .eq('owner_id', route.params.id)
          .order('created_at', { ascending: false })
        await timelineStore.setTimeline(newTimelineData || [])
      })
    .subscribe()
})
</script>

<style scoped>
.analytics-card {
  @apply bg-white/5 backdrop-blur border border-white/10;
}

.analytics-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
}

.activity-icon {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm;
}

.clickable-card {
  @apply cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg;
}

.clickable-card:hover {
  @apply border-blue-500/50;
}
</style>