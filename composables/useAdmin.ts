import type { Merchant, Vendor, User } from '~/types'

export const useAdmin = () => {
  const merchantStore = useMerchantStore()
  const vendorStore = useVendorStore()
  const userStore = useUserStore()

  const allMerchants = computed<Merchant[]>(() => merchantStore.getAllMerchants)
  const merchantsLoading = computed(() => merchantStore.loading)

  const allVendors = computed<Vendor[]>(() => vendorStore.getAllVendors)
  const vendorsLoading = computed(() => vendorStore.loading)

  const allUsers = computed<User[]>(() => userStore.getAllUsers)
  const usersLoading = computed(() => userStore.loading)

  const merchantsLoaded = ref(false)
  const vendorsLoaded = ref(false)
  const usersLoaded = ref(false)

  const loadMerchants = async () => {
    if (merchantsLoaded.value) return
    await merchantStore.loadMerchants()
    merchantsLoaded.value = true
  }

  const loadVendors = async () => {
    if (vendorsLoaded.value) return
    await vendorStore.loadVendors()
    vendorsLoaded.value = true
  }

  const loadUsers = async () => {
    if (usersLoaded.value) return
    await userStore.loadUsers()
    usersLoaded.value = true
  }

  return {
    allMerchants,
    merchantsLoading,
    merchantsLoaded,
    loadMerchants,

    allVendors,
    vendorsLoading,
    vendorsLoaded,
    loadVendors,

    allUsers,
    usersLoading,
    usersLoaded,
    loadUsers
  }
}
