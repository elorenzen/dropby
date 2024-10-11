import { defineStore } from 'pinia'

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    allMerchants: []
  }),
  getters: {
    getAllMerchants: (state) => state.allMerchants
  },
  actions: {
    async setAllMerchants(merchants: []) {
        this.allMerchants = merchants
    },
  }
})
