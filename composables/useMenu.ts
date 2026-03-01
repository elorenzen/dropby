export const useMenu = () => {
  const menuStore = useMenuStore()
  const api = useApi()
  const generatingDescription = ref(false)

  const menuItems = computed(() => menuStore.menuItems)
  const loading = computed(() => menuStore.loading)
  const creating = computed(() => menuStore.creating)
  const updating = computed(() => menuStore.updating)
  const types = computed(() => menuStore.getTypes)

  const generateDescription = async (itemName: string): Promise<string | null> => {
    generatingDescription.value = true
    try {
      const response = await api.get<string>('/api/generateMenuItemDescription', {
        params: { string: itemName }
      })
      return response || null
    } catch (error) {
      console.error('Error generating description:', error)
      throw error
    } finally {
      generatingDescription.value = false
    }
  }

  return {
    menuItems,
    loading,
    creating,
    updating,
    types,
    generatingDescription,
    generateDescription
  }
}
