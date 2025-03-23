import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    eventsById: [],
    allEvents: []
  }),
  getters: {
    getAllEvents: (state) => state.allEvents,
    getAllOpenEvents: (state) => {
      return state.allEvents
        .filter((e) =>
          e.status == 'open' &&
          (Date.now() < new Date(e.start).getTime())
        )
        .sort((a,b) => Date.parse(b.start) - Date.parse(a.start))
    }
  },
  actions: {
    async setAllEvents(events: []) {
        this.allEvents = events
    },
    async getEventsByMerchantId(id: any) {
      return this.allEvents
        .filter(e => e.merchant === id)
        .sort((a,b) => Date.parse(b.start) - Date.parse(a.start))
    },
    async getBookedEventsByVendorId(id: any) {
      return this.allEvents
        .filter(e => e.vendor === id && e.status === 'booked')
        .sort((a,b) => Date.parse(b.start) - Date.parse(a.start))
    },
    async getPendingEventsByVendorId(id: any) {
      return this.allEvents
        .filter(e => e.pending_requests && e.pending_requests.includes(id) && e.status === 'open')
        .sort((a,b) => Date.parse(b.start) - Date.parse(a.start))
    }
  }
})
