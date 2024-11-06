import { defineStore } from 'pinia'

export const useMenuItemStore = defineStore('menuItem', {
  state: () => ({
    allMenuItems: []
  }),
  getters: {
    getMenuItemsByMerchantId: (state) => {
        return (id) => state.allMenuItems.filter((menuItem) => menuItem.merchant === id)
    },
    getAllMenuItems: (state) => state.allMenuItems,
  },
  actions: {
    async setAllMenuItems(menuItems: []) {
        this.allMenuItems = menuItems
    },
  }
})
