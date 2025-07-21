<template>
    <div class="min-h-screen bg-background p-6">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-text-main mb-2">
              Welcome back, {{ user?.first_name || 'Merchant' }}! 👋
            </h1>
            <p class="text-text-muted text-lg">
              Here's what's happening with {{ merchant?.name || 'your business' }} today
            </p>
          </div>
          <div class="flex items-center gap-4">
            <Menu ref="menu" :model="menuItems" :popup="true" />
            <Button 
              icon="pi pi-bars" 
              @click="toggleMenu"
              outlined 
              aria-label="Menu"
            />
          </div>
        </div>
      </div>
  
      <!-- Analytics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card class="analytics-card">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm font-medium">Open Events</p>
                <p class="text-3xl font-bold text-text-main">{{ analytics.openEvents }}</p>
                <p class="text-orange-500 text-sm mt-1">
                  <i class="pi pi-exclamation-triangle mr-1"></i>
                  {{ analytics.pendingRequests }} pending requests
                </p>
              </div>
              <div class="analytics-icon bg-orange-100 dark:bg-orange-900">
                <i class="pi pi-calendar-plus text-orange-600 dark:text-orange-400"></i>
              </div>
            </div>
          </template>
        </Card>
  
        <Card class="analytics-card">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm font-medium">Booked Events</p>
                <p class="text-3xl font-bold text-text-main">{{ analytics.bookedEvents }}</p>
                <p class="text-green-500 text-sm mt-1">
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
  
        <Card class="analytics-card">
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm font-medium">Completed Events</p>
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
  
        <Card class="analytics-card">
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
              <div class="analytics-icon bg-purple-100 dark:bg-purple-900">
                <i class="pi pi-star text-purple-600 dark:text-purple-400"></i>
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
              <EventCalendar />
            </template>
          </Card>
  
          <!-- Recent Events Table -->
          <Card>
            <template #title>
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold">Recent Events</h3>
                <Button 
                  label="View All" 
                  size="small" 
                  text 
                  @click="navigateToSettings"
                />
              </div>
            </template>
            <template #content>
              <MerchantEventTable />
            </template>
          </Card>
        </div>
  
        <!-- Right Column - Activity & Charts -->
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
  const supabase = useSupabaseClient()
  const store = useUserStore()
  const user = ref(store.user)
  const route = useRoute()
  const merchantStore = useMerchantStore()
  const merchant = ref<any>(await merchantStore.getMerchantById(route.params.id))
  const timelineStore = useTimelineStore()
  const { data: timelineData, error: timelineError } = await supabase
    .from('timeline_items')
    .select('*')
    .eq('owner_id', route.params.id)
    .order('created_at', { ascending: false })
  
  if (timelineError) {
    console.error('Error loading timeline:', timelineError)
  }
  
  await timelineStore.setTimeline(timelineData || [])
  const menu = ref()
  
  // Analytics data (move above menuItems)
  const analytics = ref({
    totalEvents: 24,
    eventsGrowth: 12,
    openEvents: 0,
    bookedEvents: 0,
    upcomingWeek: 0,
    pendingRequests: 0,
    averageRating: 4.2,
    totalRatings: 18
  })
  
  useSeoMeta({ title: () => `${merchant.value?.name || 'Merchant'} Dashboard` })
  
  const menuItems = ref([
    {
      label: 'Schedule New Event',
      icon: 'pi pi-calendar-plus',
      command: () => navigateToSettings()
    },
    {
      label: 'Ratings & Reviews',
      icon: 'pi pi-star',
      command: () => navigateTo(`/merchant/${route.params.id}/ratings-and-reviews`)
    },
    {
      label: 'Review Requests',
      icon: 'pi pi-inbox',
      badge: analytics.value.pendingRequests.toString(),
      command: () => navigateToSettings()
    },
    {
      label: 'Update Profile',
      icon: 'pi pi-user-edit',
      command: () => navigateToSettings()
    },
    {
      label: 'View Analytics',
      icon: 'pi pi-chart-bar',
      command: () => navigateToSettings()
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
  
  // Recent activity data - now computed from timeline
  const recentActivity = computed(() => {
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
  })
  
  const timelineItems = computed(() => {
    return timelineStore.getTimeline
  })
  
  // Debug timeline data
  watchEffect(() => {
    console.log('Timeline items:', timelineItems.value)
  })
  
  // Methods
  const navigateToSettings = () => {
    navigateTo(`/settings/${route.params.id}`)
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
        // Only count booked events (those with a vendor)
        const bookedEvents = events.filter((e: any) => e.vendor && e.status === 'booked')
        analytics.value.totalEvents = bookedEvents.length
        analytics.value.bookedEvents = bookedEvents.length
        
        // Count future events with open status
        const futureOpenEvents = events.filter((e: any) => e.status === 'open' && new Date(e.start) > now)
        analytics.value.openEvents = futureOpenEvents.length
        
        // Calculate pending requests for future events with pending status
        const futurePendingEventsWithRequests = events.filter((e: any) => 
          e.status === 'pending' && 
          new Date(e.start) > now && 
          e.pending_requests && 
          e.pending_requests.length > 0
        )
        const totalPendingRequests = futurePendingEventsWithRequests.reduce((total: number, e: any) => {
          return total + e.pending_requests.length
        }, 0)
        analytics.value.pendingRequests = totalPendingRequests
      
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
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }
  
  onMounted(() => {
    loadAnalytics()
    console.log('Timeline items on mount:', timelineItems.value)
    console.log('Timeline store state:', timelineStore.timeline)
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
  </style>