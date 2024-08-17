<script setup>
const addMerchant = async () => {
    console.log('hit!')
}

/**
 * 
 * const merchantObj = {
 *  id: v4(),
 *  merchantName: merchantName.value,
 *  merchantContactIds: merchantIds.value
 *  
 * }
 * const merchant = {
    id: v4(),
        // Random ID generator from package install

    merchantName: String,
        // eg. 'Hop Secret'

    merchantContactIds: Array,
        // Populated by merchant user IDs.
        // '/merchantUsers' Db collection will have more comprehensive data of admins for each merchant object.
        // eg. [ '<christhomasId>', '<kypedullaId>' ]

    address_components: Array,
        // Using Google's Autocomplete SDK, users enter input and upon selection,
        // Google will return comprehensive address data for each address field(ZIP, county, etc.)
        // This data is returned and set as array, as seen below.

    bookedEvents: Array,
        // Populated by event IDs from '/scheduledEvents'

    avgVendorRating: Number,
        // decimal score out of 5 based on completed events by vendors, who have since rated the merchant

    vendorComments: Map
        // Array of objects populated by associated comment objects from '/vendorComments'
}
 */
</script>

<template>
  <form class="form-widget" @submit.prevent="addMerchant">
    MERCHANT SIGNUP FORM
    
    <div class="m-2">
        <UInput class="inputField" type="email" placeholder="Email" />
    </div>
    <div class="m-2">primary contact phone</div>
    <div class="m-2">primary contact email</div>
    <div class="m-2">website url</div>
    <div class="m-2">IG url?</div>

    <div class="m-2">adress component gather</div>
    <div class="m-2">(optional) - component for listing top nearby vendors, and allow user to select "preferences"</div>
    <div class="m-2">availability component gather</div>
  </form>
</template>