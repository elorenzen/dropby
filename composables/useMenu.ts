export const useMenu = () => {
  const menuStore = useMenuStore()
  const generatingDescription = ref(false)

  const menuItems = computed(() => menuStore.menuItems)
  const loading = computed(() => menuStore.loading)
  const creating = computed(() => menuStore.creating)
  const updating = computed(() => menuStore.updating)
  const types = computed(() => menuStore.getTypes)

  const generateDescription = async (itemName: string): Promise<string | null> => {
    generatingDescription.value = true
    try {
      return await menuStore.generateDescription(itemName)
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
