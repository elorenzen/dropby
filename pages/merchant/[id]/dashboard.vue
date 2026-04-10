<template>
    <div class="min-h-screen bg-background p-4 sm:p-6">
      <!-- Loading State -->
      <PageSkeleton v-if="loading" :show-stats="true" :show-list="false" />

      <div v-else>
      <!-- Trial Expired Alert -->
      <div v-if="trialExpired && !trialAlertDismissed" class="bg-danger-light border border-danger-light rounded-lg p-4 mb-6 flex items-start gap-3">
        <i class="pi pi-exclamation-triangle text-xl mt-0.5 icon-danger"></i>
        <div class="flex-1">
          <h4 class="font-semibold mb-1 text-danger-dark">Your free trial has ended</h4>
          <p class="text-sm mb-3 text-danger">
            Add a payment method in Settings to continue your paid plan, or your account will be downgraded to the free plan.
          </p>
          <div class="flex gap-2">
            <Button label="Go to Payment Settings" icon="pi pi-credit-card" size="small" severity="danger" @click="navigateTo(`/settings/${route.params.id}/?activeTab=2`)" />
            <Button label="Dismiss" size="small" text @click="trialAlertDismissed = true" />
          </div>
        </div>
      </div>

      <!-- Trial Active Banner -->
      <div v-if="isTrialing" class="bg-info-light border border-info-light rounded-lg p-4 mb-6 flex items-start gap-3">
        <i class="pi pi-clock text-xl mt-0.5 icon-info"></i>
        <div class="flex-1">
          <p class="text-sm font-medium text-info-dark">
            Free trial active — {{ trialDaysRemaining }} day{{ trialDaysRemaining !== 1 ? 's' : '' }} remaining.
            <NuxtLink :to="`/settings/${route.params.id}/?activeTab=2`" class="underline">Add a payment method</NuxtLink> to continue after your trial.
          </p>
        </div>
      </div>

      <!-- Header Section -->
      <div class="mb-6 md:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-text-main mb-2">
              Welcome back, {{ user?.first_name || 'Merchant' }}!
            </h1>
            <p class="text-text-muted text-base sm:text-lg">
              Here's what's happening with {{ merchant?.merchant_name || 'your business' }} today
            </p>
          </div>
          <div class="flex items-center gap-4 desktop-only">
            <Button 
              icon="pi pi-arrow-left" 
              @click="navigateToEvents"
              outlined 
              label="View Events"
            />
          </div>
        </div>
      </div>
      
      <!-- Event Create Dialog -->
      <EventCreate 
        v-if="merchant"
        :visible="showCreateDialog"
        @update:visible="showCreateDialog = $event"
        :merchant="merchant"
        @event-created="onEventCreated"
      />
  
      <!-- Analytics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card class="analytics-card clickable-card" @click="navigateToEvents">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm font-medium">Open Events</p>
                <p class="text-3xl font-bold text-text-main">{{ analytics.openEvents }}</p>
                <p class="text-primary-dark text-sm mt-1">
                  <i class="pi pi-exclamation-triangle mr-1"></i>
                  {{ analytics.pendingRequests }} pending requests
                </p>
              </div>
              <div class="analytics-icon bg-primary-light">
                <i class="pi pi-calendar-plus icon-primary"></i>
              </div>
            </div>
          </template>
        </Card>
  
        <Card class="analytics-card clickable-card" @click="navigateToEvents">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm font-medium">Booked Events</p>
                <p class="text-3xl font-bold text-text-main">{{ analytics.bookedEvents }}</p>
                <p class="text-success text-sm mt-1">
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
                <p class="text-text-muted text-sm font-medium">Completed Events</p>
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
  
        <Card class="analytics-card clickable-card" @click="navigateToRatings">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm font-medium">Average Rating</p>
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
      </div>
  
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <!-- Left Column - Calendar & Events -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Calendar Section -->
          <Card>
            <template #title>
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold">Event Calendar</h3>
              </div>
            </template>
            <template #content>
              <EventCalendar 
                user-type="merchant" 
                :merchant="merchant" 
              />
            </template>
          </Card>
        </div>
  
        <!-- Right Column - Quick Actions, Activity & Charts -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <QuickActions user-type="merchant" @create-event="openCreateEventDialog" />
          
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
  import EventCreate from '~/components/event/Create.vue'
  import PageSkeleton from '~/components/skeleton/PageSkeleton.vue'
  
  definePageMeta({
    middleware: ['auth']
  })
  const supabase = useSupabaseClient()
  const store = useUserStore()
  const user = ref(store.user)
  const route = useRoute()
  const merchantStore = useMerchantStore()
  const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))
  const subcriptionStore = useSubscriptionStore()
  
  const loading = ref(true)
  
  // Create event dialog state
  const showCreateDialog = ref(false)

  // Trial state
  const trialAlertDismissed = ref(false)
  const isTrialing = computed(() => subcriptionStore.isTrialing)
  const trialExpired = computed(() => subcriptionStore.trialExpired)
  const trialDaysRemaining = computed(() => {
    const trialEnd = subcriptionStore.trialEndDate
    if (!trialEnd) return null
    const now = new Date()
    const end = new Date(trialEnd)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  })

  const timelineStore = useTimelineStore()
  await timelineStore.loadTimeline(route.params.id as string)

  const reviewStore = useReviewStore()
  await reviewStore.loadReviewsForBusiness(route.params.id as string, 'merchant')

  await subcriptionStore.setActiveSubscription(route.params.id as string, 'merchant')
  const activeSubscription = subcriptionStore.getActiveSubscription
  console.log('Active subscription:', activeSubscription)
  const menu = ref()
  
  // Analytics data (move above menuItems)
  const receivedReviewsData = reviewStore.getReceivedReviews
  const initialAverageRating = receivedReviewsData.length > 0
    ? Math.round((receivedReviewsData.reduce((sum: number, review: any) => sum + review.rating, 0) / receivedReviewsData.length) * 10) / 10
    : 0
  
  const analytics = ref({
    totalEvents: 24,
    eventsGrowth: 12,
    openEvents: 0,
    bookedEvents: 0,
    upcomingWeek: 0,
    pendingRequests: 0,
    averageRating: initialAverageRating,
    totalRatings: receivedReviewsData.length
  })
  
  useSeoMeta({ title: () => `Dashboard | ${merchant.value?.merchant_name || 'Merchant'}` })
  
  const menuItems = ref([
    {
      label: 'Events',
      icon: 'pi pi-calendar-plus',
      command: () => navigateTo(`/merchant/${route.params.id}/events`)
    },
    {
      label: 'Ratings & Reviews',
      icon: 'pi pi-star',
      command: () => navigateTo(`/merchant/${route.params.id}/ratings-and-reviews`)
    },
    {
      label: 'View Analytics',
      icon: 'pi pi-chart-bar',
      command: () => navigateTo(`/merchant/${route.params.id}/analytics`)
    },
    { separator: true },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => navigateToSettings()
    }
  ])
  
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
  
  // Timeline items computed
  const timelineItems = computed(() => {
    return timelineStore.getTimeline || []
  })
  
  // Recent activity data - now computed from timeline
  const { getTimelineConfig } = useTimelineIcons()
  const recentActivity = computed(() => {
    if (!timelineItems.value || timelineItems.value.length === 0) {
      return []
    }
    
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
  })
  
  // Debug timeline data
  watchEffect(() => {
    console.log('Timeline items:', timelineItems.value)
  })
  
  // Methods
  const navigateToSettings = () => {
    navigateTo(`/settings/${route.params.id}`)
  }
  
  const navigateToEvents = () => {
    navigateTo(`/merchant/${route.params.id}/events`)
  }
  
  const navigateToRatings = () => {
    navigateTo(`/merchant/${route.params.id}/ratings-and-reviews`)
  }
  
  const openCreateEventDialog = () => {
    showCreateDialog.value = true
  }
  
  const onEventCreated = () => {
    showCreateDialog.value = false
    // Refresh analytics
    loadAnalytics()
  }
  
  const toggleMenu = (event: Event) => {
    menu.value?.toggle(event)
  }
  
  const loadAnalytics = async () => {
    try {
      const merchantId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
      const analyticsData = await merchantStore.getDashboardMetrics(merchantId)
      
      analytics.value.totalEvents = analyticsData.totalEvents
      analytics.value.eventsGrowth = analyticsData.eventsGrowth
      analytics.value.openEvents = analyticsData.openEvents
      analytics.value.bookedEvents = analyticsData.bookedEvents
      analytics.value.upcomingWeek = analyticsData.upcomingWeek
      analytics.value.pendingRequests = analyticsData.pendingRequests
      analytics.value.averageRating = analyticsData.averageRating
      analytics.value.totalRatings = analyticsData.totalRatings
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }
  
  onMounted(async () => {
    await loadAnalytics()
    loading.value = false

    const merchantId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

    // Subscribe to real-time updates for reviews
    supabase
      .channel('reviews')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' }, 
        async (payload: any) => {
          await reviewStore.loadReviewsForBusiness(merchantId, 'merchant')
        })
      .subscribe()

    // Subscribe to real-time updates for timeline items
    supabase
      .channel('timeline')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'timeline_items' }, 
        async (payload: any) => {
          // Reload timeline data when there are changes
          await timelineStore.loadTimeline(merchantId)
        })
      .subscribe()
  })
  </script>
  
<style scoped>
.analytics-card {
  background: var(--p-surface-card) !important;
  border: 1px solid var(--p-surface-border) !important;
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

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .analytics-card :deep(.p-card-content) {
    padding: 0.75rem !important;
  }

  .analytics-card .text-3xl {
    font-size: 1.5rem;
  }

  .analytics-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .clickable-card:hover {
    transform: none;
  }
}
</style>