<script setup>
const name = ref('')
const website = ref('')
const ig = ref('')
const primaryPhone = ref('')
const primaryEmail = ref('')

const addMerchant = async () => {
    const merchantObj = {
        id: '', // v4(),
        created: new Date(),
        name: name.value,
        formattedAddress: '',
        address_components: [],
        associatedIds: [],
        website: website.value,
        ig: ig.value,
        primaryPhone: primaryPhone.value,
        primaryEmail: primaryEmail.value,
        bookedEvents: [],
        avgVendorRating: null,
        vendorComments: [],
    }
    console.log('merchant object: ', merchantObj)
}
</script>

<template>
  <form class="form-widget" @submit.prevent="addMerchant">
    <div class="m-2">
        <UInput v-model="name" placeholder="Merchant Name (e.g. 'McDonald's')" />
    </div>
    <div class="m-2">
        <UInput v-model="website" placeholder="Website URL" />
    </div>
    <div class="m-2">
        <UInput v-model="ig" placeholder="Instagram Link (optional)" />
    </div>
    <div class="m-2">
        <UInput v-model="primaryPhone" placeholder="Primary Contact Phone" />
    </div>
    <div class="m-2">
        <UInput v-model="primaryEmail" placeholder="Primary Contact Email" />
    </div>
    <div class="m-2">
        <UInput placeholder="Merchant Address" />
    </div>
    
    <div class="m-2">(optional) - component for listing top nearby vendors, and allow user to select "preferences"</div>
    <div class="m-2">availability component gather</div>
    <div class="flex justify-center px-2">
        <div class="m-2"><UButton @click="addMerchant">Add Merchant</UButton></div>
    </div>
  </form>
</template>