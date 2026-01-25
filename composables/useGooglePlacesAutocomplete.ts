/**
 * Composable for Google Maps Places Autocomplete
 * 
 * Provides a reusable way to initialize Google Maps Places Autocomplete
 * with consistent error handling and SSR safety.
 */

export interface PlaceData {
  addressComponents?: any[]
  coordinates?: { lat: number; lng: number }
  formattedAddress?: string
  addressUrl?: string
  name?: string
  placeId?: string
}

export interface UseGooglePlacesAutocompleteOptions {
  /**
   * Country restriction (default: 'us')
   */
  countryRestriction?: string | string[]
  
  /**
   * Additional fields to request from Places API
   */
  fields?: string[]
  
  /**
   * Whether to use strict bounds
   */
  strictBounds?: boolean
  
  /**
   * Callback function when place is selected
   */
  onPlaceSelected?: (place: PlaceData) => void
}

export const useGooglePlacesAutocomplete = (
  inputRef: Ref<HTMLInputElement | null>,
  options: UseGooglePlacesAutocompleteOptions = {}
) => {
  const config = useRuntimeConfig()
  
  // Reactive place data
  const placeData = ref<PlaceData>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const {
    countryRestriction = 'us',
    fields = ['geometry/location', 'name', 'formatted_address', 'types'],
    strictBounds = false,
    onPlaceSelected
  } = options
  
  const initialize = async () => {
    if (!inputRef.value) {
      console.warn('Input ref is not available')
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Dynamic import to avoid SSR issues
      const { Loader } = await import('@googlemaps/js-api-loader')
      
      const loader = new Loader({
        apiKey: config.public.gMapKey,
        version: 'beta',
        libraries: ['places'],
      })
      
      const google = await loader.load()
      
      const autocompleteOptions = {
        componentRestrictions: typeof countryRestriction === 'string' 
          ? { country: countryRestriction }
          : { country: countryRestriction },
        fields,
        strictBounds,
      }
      
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.value,
        autocompleteOptions
      )
      
      autocomplete.addListener('place_changed', () => {
        const placeResponse = autocomplete.getPlace()
        
        // Extract place data
        const data: PlaceData = {
          addressComponents: placeResponse.address_components,
          formattedAddress: placeResponse.formatted_address,
          addressUrl: placeResponse.url,
          name: placeResponse.name,
          placeId: placeResponse.place_id,
        }
        
        // Extract coordinates if available
        if (placeResponse.geometry?.location) {
          data.coordinates = {
            lat: placeResponse.geometry.location.lat(),
            lng: placeResponse.geometry.location.lng(),
          }
        }
        
        // Update reactive place data
        placeData.value = data
        
        // Call custom callback if provided
        if (onPlaceSelected) {
          onPlaceSelected(data)
        }
      })
      
    } catch (err: any) {
      console.warn('Google Maps API not available:', err)
      error.value = err.message || 'Failed to initialize Google Maps Places Autocomplete'
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    placeData: readonly(placeData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    initialize,
  }
}
