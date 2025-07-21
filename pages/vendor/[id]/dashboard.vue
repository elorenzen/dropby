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
            label="Find Events" 
            icon="pi pi-search" 
            @click="navigateToEvents"
            class="bg-accent text-background hover:bg-accent-dark"
          />
          <Button 
            label="Settings" 
            icon="pi pi-cog" 
            outlined 
            @click="navigateToSettings"
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

      <Card class="analytics-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-muted text-sm font-medium">Upcoming Events</p>
              <p class="text-3xl font-bold text-text-main">{{ analytics.upcomingEvents }}</p>
              <p class="text-orange-500 text-sm mt-1">
                <i class="pi pi-clock mr-1"></i>
                Next: {{ analytics.nextEventDate }}
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

      <Card class="analytics-card">
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
            <BaseCalendar :attributes="attributes" :refresh="refreshKey" @dayclick="openDayView" />
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
        <!-- Quick Actions -->
        <Card>
          <template #title>
            <h3 class="text-xl font-semibold">Quick Actions</h3>
          </template>
          <template #content>
            <div class="space-y-3">
              <Button 
                label="Find Available Events" 
                icon="pi pi-search" 
                class="w-full justify-start"
                @click="navigateToEvents"
              />
              <Button 
                label="Update Menu" 
                icon="pi pi-list" 
                class="w-full justify-start"
                @click="navigateToSettings"
              />
              <Button 
                label="Update Profile" 
                icon="pi pi-user-edit" 
                class="w-full justify-start"
                @click="navigateToSettings"
              />
              <Button 
                label="View Analytics" 
                icon="pi pi-chart-bar" 
                class="w-full justify-start"
                @click="navigateToSettings"
              />
            </div>
          </template>
        </Card>

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

    <!-- Add Event Dialog -->
        <Dialog v-model="addEventDialog" modal :header="`Add Event for ${newEventDate.toLocaleDateString()}`" :style="{ width: '45rem' }">
            <EventBaseDialog>
                <template #content>
                    <Fluid>
                        <div class="col-span-full">
                            <FloatLabel variant="on" class="my-4">
                            <DatePicker id="new-event-start" v-model="newEventStart" timeOnly fluid hourFormat="12" />
                <label for="new-event-start" class="block mb-2">Start Time</label>
                            </FloatLabel>
                        </div>
                        <div class="col-span-full">
                            <FloatLabel variant="on" class="my-4">
                <label for="new-event-end" class="block mb-2">End Time</label>
                            <DatePicker id="new-event-end" v-model="newEventEnd" timeOnly fluid hourFormat="12" />
                            </FloatLabel>
                        </div>
                        <div class="col-span-full">
                            <FloatLabel variant="on" class="my-4">
                                <Textarea id="notes" v-model="notes" rows="3" />
                <label for="notes">Notes</label>
                            </FloatLabel>
                        </div>
                    </Fluid>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button
                            @click="addEvent"
              :disabled="!newEventStart || !newEventEnd || new Date(newEventStart).getTime() < new Date().getTime()"
                            label="Add Event"
                            class="w-full"
                            :loading="loading"
            />
                    </div>
                </template>
            </EventBaseDialog>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth']
})

import { v4 as uuidv4 } from 'uuid'

// Define interfaces for type safety
interface User {
  id: string
  first_name?: string
  last_name?: string
  associated_vendor_id?: string
  [key: string]: any
}

interface Vendor {
  id: string
  vendor_name?: string
  [key: string]: any
}

const supabase = useSupabaseClient()
const userStore = useUserStore()
const vendorStore = useVendorStore()
const eventStore = useEventStore()

const user = ref<User | null>(userStore.user as User | null)
const vendor = ref<Vendor | null>((await vendorStore.getVendorById(user.value?.associated_vendor_id || '')) as unknown as Vendor | null)

useSeoMeta({ title: () => `${vendor.value?.vendor_name || 'Vendor'} Dashboard` })

const refreshKey = ref(0)
const addEventDialog = ref(false)
const allEvents = ref(eventStore.getAllOpenEvents)
const bookedEvents = ref(await eventStore.getBookedEventsByVendorId(vendor.value?.id || ''))
const pendingEvents = ref(await eventStore.getPendingEventsByVendorId(vendor.value?.id || ''))
const newEventDate = ref(new Date())
const newEventStart = ref(new Date())
const newEventEnd = ref(new Date())
const notes = ref('')
const loading = ref(false)
const dayId = ref()

// Analytics data
const analytics = ref({
  totalEvents: 18,
  eventsGrowth: 8,
  upcomingEvents: 4,
  nextEventDate: 'Jul 20',
  pendingRequests: 2,
  averageRating: 4.5,
  totalRatings: 12
})

// Recent activity data
const recentActivity = ref([
  {
    id: 1,
    title: 'Event Request Sent',
    description: 'Requested to book at Secret Brewing Company',
    time: '1 hour ago',
    icon: 'pi pi-send',
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
  },
  {
    id: 2,
    title: 'Event Approved',
    description: 'Your request for July 15th was approved',
    time: '3 hours ago',
    icon: 'pi pi-check-circle',
    iconClass: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
  },
  {
    id: 3,
    title: 'New Rating Received',
    description: '4.5 stars from Downtown Brewery',
    time: '1 day ago',
    icon: 'pi pi-star',
    iconClass: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
  },
  {
    id: 4,
    title: 'Menu Updated',
    description: 'Added 3 new menu items',
    time: '2 days ago',
    icon: 'pi pi-list',
    iconClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
  }
])

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

// Methods
const route = useRoute()

const navigateToSettings = () => {
  navigateTo(`/settings/${route.params.id}`)
}

const navigateToEvents = () => {
  navigateTo('/viewer/events')
}

const goToToday = () => {
  // Implementation for going to today's date in calendar
  console.log('Go to today')
}

const openDayView = (day: any) => {
  newEventDate.value = day.date
        addEventDialog.value = true
}

const addEvent = async () => {
    if (!vendor.value?.id) {
        console.error('Vendor not found')
        return
    }

    loading.value = true
    const startHours = new Date(newEventStart.value).getHours()
    const endHours = new Date(newEventEnd.value).getHours()
    const day = new Date(newEventDate.value)
    const eventStart = new Date(day.setHours(startHours))
    const eventEnd = new Date(day.setHours(endHours))

    const evtObj = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        merchant: null,
        vendor: vendor.value.id,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        day_id: dayId.value,
        status: 'booked',
        vendor_rating: null,
        merchant_rating: null,
        vendor_comment: null,
        merchant_comment: null,
        notes: notes.value
    }
    
    try {
        const { error } = await supabase.from('events').insert(evtObj as any)
        if (error) {
            console.error('Error creating event:', error)
    } else {
      addEventDialog.value = false
      refreshKey.value++
      // Reset form
      newEventStart.value = new Date()
      newEventEnd.value = new Date()
      notes.value = ''
        }
    } catch (err) {
        console.error('Error inserting event:', err)
    }
    
    loading.value = false
  }

// Load real analytics data
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
      
      analytics.value.totalEvents = events.length
      analytics.value.upcomingEvents = events.filter((e: any) => e.status === 'booked' && new Date(e.start) > now).length
      analytics.value.pendingRequests = events.filter((e: any) => e.status === 'open' && e.pending_requests && e.pending_requests.includes(vendor.value?.id)).length
      
      // Find next event date
      const upcomingEvents = events.filter((e: any) => e.status === 'booked' && new Date(e.start) > now)
        .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
      
      if (upcomingEvents.length > 0) {
        const nextEvent = new Date((upcomingEvents[0] as any).start)
        analytics.value.nextEventDate = `${nextEvent.getMonth() + 1}/${nextEvent.getDate()}`
      }
      
      // Calculate events growth (this month vs last month)
      const thisMonthEvents = events.filter((e: any) => new Date(e.created_at) >= thisMonth).length
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEvents = events.filter((e: any) => {
        const created = new Date(e.created_at)
        return created >= lastMonth && created < thisMonth
      }).length
      
      analytics.value.eventsGrowth = lastMonthEvents > 0 ? 
        Math.round(((thisMonthEvents - lastMonthEvents) / lastMonthEvents) * 100) : 0
    }
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

// Load data on mount
onMounted(() => {
  loadAnalytics()
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