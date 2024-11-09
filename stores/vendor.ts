import { defineStore } from 'pinia'

export const useVendorStore = defineStore('vendor', {
  state: () => ({
    allVendors: []
  }),
  getters: {
    getAllVendors: (state) => state.allVendors
  },
  actions: {
    async setAllVendors(vendors: []) {
        this.allVendors = vendors
    },
    async getVendorById(id: any) {
      return this.allVendors.find(vendor => vendor.id === id)
    }
  }
})
