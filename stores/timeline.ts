import { defineStore } from 'pinia'

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    timeline: []
  }),
  getters: {
    getTimeline: (state) => state.timeline
  },
  actions: {
    async setTimeline(timeline: []) {
      this.timeline = timeline
    }
  }
})