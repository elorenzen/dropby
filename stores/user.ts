import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    description: ''
  }),
  actions: {
    async fetchUser(userParam: any) {
      if (userParam) this.user = userParam
    }
  }
})
