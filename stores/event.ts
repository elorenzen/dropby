import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    eventsById: [],
    allEvents: []
  }),
  getters: {
    getEventsByMerchantId: (state) => {
        return (id) => state.allEvents.filter((event) => event.merchant === id)
    }
  },
  actions: {
    async setAllEvents(events: []) {
        this.allEvents = events
    },
    async getEventsById(id: any, type: any) {
        console.log("'getEventsById' id: ", id)
        console.log("'getEventsById' type: ", type)
    //   console.log('userParam: ', userParam)
    //   if (userParam) this.user = userParam
    }
  }
})
