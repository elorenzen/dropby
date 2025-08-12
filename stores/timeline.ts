import { defineStore } from 'pinia'

export interface TimelineItem {
  id: string
  owner_id: string
  title: string
  description: string
  type: string
  created_at: string
}

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    timeline: [] as TimelineItem[],
    loading: false,
    creating: false
  }),
  
  getters: {
    getTimeline: (state) => state.timeline
  },
  
  actions: {
    async setTimeline(timeline: TimelineItem[] | null) {
      console.log('Setting timeline:', timeline)
      this.timeline = timeline || []
    },

    async createTimelineItem(timelineData: Partial<TimelineItem>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('timeline_items')
          .insert(timelineData as any)
          .select()
          .single()

        if (error) throw error

        // Add to local state
        this.timeline.unshift(data)
        
        return data
      } catch (error) {
        console.error('Error creating timeline item:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async loadTimeline(ownerId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('timeline_items')
          .select('*')
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.timeline = data || []
        return data
      } catch (error) {
        console.error('Error loading timeline:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  }
})