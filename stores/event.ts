import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    eventsById: [],
    allEvents: []
  }),
  getters: {
    getAllEvents: (state) => state.allEvents,
    getAllOpenEvents: (state) => state.allEvents.filter(e => e.status == 'open')
  },
  actions: {
    async setAllEvents(events: []) {
        this.allEvents = events
    },
    async getEventsByMerchantId(id: any) {
      return this.allEvents.filter(e => e.merchant === id)
    }
  }
})
