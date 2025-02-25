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
  }
})
