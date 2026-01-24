<template>
    <div class="min-h-screen bg-background p-6">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-text-main mb-2">
              Welcome back, {{ user?.first_name || 'Merchant' }}!
            </h1>
            <p class="text-text-muted text-lg">
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
  </template>
  
  <script setup lang="ts">
  import EventCreate from '~/components/event/Create.vue'
  
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
  
  // Create event dialog state
  const showCreateDialog = ref(false)

  const timelineStore = useTimelineStore()
  const { data: timelineData, error: timelineError } = await supabase
    .from('timeline_items')
    .select('*')
    .eq('owner_id', route.params.id)
    .order('created_at', { ascending: false })
  await timelineStore.setTimeline(timelineData || [])

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
      // Get events for this merchant
      const { data: events } = await useSupabaseClient()
        .from('events')
        .select('*')
        .eq('merchant', route.params.id)
      
      if (events) {
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        // Count completed events for the "Completed Events" card
        const completedEvents = events.filter((e: any) => e.status === 'completed')
        analytics.value.totalEvents = completedEvents.length
        
        // Count booked events (those with a vendor) for the "Booked Events" card
        const bookedEvents = events.filter((e: any) => e.vendor && e.status === 'booked')
        analytics.value.bookedEvents = bookedEvents.length
        
        // Count future events with open status
        const futureOpenEvents = events.filter((e: any) => e.status === 'open' && new Date(e.start) > now)
        analytics.value.openEvents = futureOpenEvents.length
        
        // Calculate pending requests for future events with open status that have pending requests
        const futureOpenEventsWithRequests = events.filter((e: any) => 
          e.status === 'open' && 
          new Date(e.start) > now && 
          e.pending_requests && 
          e.pending_requests.length > 0
        )
        const totalPendingRequests = futureOpenEventsWithRequests.reduce((total: number, e: any) => {
          return total + e.pending_requests.length
        }, 0)
        analytics.value.pendingRequests = totalPendingRequests
      
        // Calculate upcoming events in next 7 days
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        analytics.value.upcomingWeek = bookedEvents.filter((e: any) => {
          const startDate = new Date(e.start)
          return startDate >= now && startDate <= nextWeek
        }).length
        
        // Calculate events growth (this month vs last month) for completed events
        const thisMonthEvents = completedEvents.filter((e: any) => new Date(e.created_at) >= thisMonth).length
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEvents = completedEvents.filter((e: any) => {
          const created = new Date(e.created_at)
          return created >= lastMonth && created < thisMonth
        }).length
        // Calculate growth percentage - handle zero cases
        if (lastMonthEvents === 0) {
          analytics.value.eventsGrowth = thisMonthEvents > 0 ? 100 : 0
        } else {
          analytics.value.eventsGrowth = Math.round(((thisMonthEvents - lastMonthEvents) / lastMonthEvents) * 100)
        }
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
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }
  
  onMounted(async () => {
    loadAnalytics()

    // Subscribe to real-time updates for reviews
    supabase
      .channel('reviews')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' }, 
        async (payload: any) => {
          const { data: receivedReviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('recipient_id', route.params.id)
            .order('created_at', { ascending: false })
          await reviewStore.setReceivedReviews(receivedReviews || [])
          const { data: sentReviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('sender_id', route.params.id)
            .order('created_at', { ascending: false })
          await reviewStore.setSentReviews(sentReviews || [])
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

/* Hide redundant buttons on mobile since we have bottom nav */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}
</style>