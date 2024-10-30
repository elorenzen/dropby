import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    users: [],
    description: ''
  }),
  getters: {
    getUser: (state) => state.user,
    getAllUsers: (state) => state.users
  },
  actions: {
    async fetchUser(userParam: any) {
      if (userParam) this.user = userParam
    },
    async setAllUsers(users: []) {
      this.users = users
  },
  }
})
