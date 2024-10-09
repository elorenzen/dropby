import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    description: ''
  }),
  actions: {
    async fetchUser(userParam: any) {
      console.log('userParam: ', userParam)
      if (userParam) this.user = userParam
    }
  }
})
