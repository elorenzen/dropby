import { defineStore } from 'pinia'

interface TimelineItem {
  id: string
  owner_id: string
  title: string
  description: string
  type: string
  created_at: string
}

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    timeline: [] as TimelineItem[]
  }),
  getters: {
    getTimeline: (state) => state.timeline
  },
  actions: {
    async setTimeline(timeline: TimelineItem[] | null) {
      console.log('Setting timeline:', timeline)
      this.timeline = timeline || []
    }
  }
})