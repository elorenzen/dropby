import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    coordinates: '',
    users: [],
    description: ''
  }),
  getters: {
    getUser: (state) => state.user,
    getAllUsers: (state) => state.users,
    getUserLocation: (state) => state.coordinates
  },
  actions: {
    async setUser(userParam: any) {
      if (userParam) this.user = userParam
    },
    async setAllUsers(users: []) {
      this.users = users
    },
    async setUserLocation(coordinates: any) {
      this.coordinates = coordinates
    }
  }
})
