import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuItems: []
  }),
  getters: {
    getMenuItems: (state) => state.menuItems,
  },
  actions: {
    async setAllMenuItems(items: []) {
      this.menuItems = items
    },
    async getAllMenuItems() {
      return this.menuItems
    },
    async getItemsByVendorId(id: any) {
      return this.menuItems.filter((i:any) => i.vendor_id === id)
    }
  }
})
