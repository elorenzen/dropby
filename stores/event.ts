import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    eventsById: [],
    allEvents: []
  }),
  getters: {
    getEventsByMerchantId: (state) => {
        return (id) => state.allEvents.filter((event) => event.merchant === id)
    },
    getAllEvents: (state) => state.allEvents,
    getAllOpenEvents: (state) => state.allEvents.filter(e => e.status == 'open')
  },
  actions: {
    async setAllEvents(events: []) {
        this.allEvents = events
    },
  }
})
