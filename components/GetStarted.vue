<template>
    <div class="card flex justify-center">
        <Stepper value="1" class="basis-[60rem]">
            <StepList>
                <Step value="1" :disabled="!step1Valid">Account Setup</Step>
                <Step value="2" :disabled="!step1Valid">Business Type</Step>
                <Step value="3" :disabled="!step1Valid || !type">Primary User Information</Step>
                <Step value="4" :disabled="!step1Valid || !type || !step3Valid">Business Information</Step>
                <Step value="5" :disabled="!step1Valid || !type || !step3Valid || !step4Valid">Review</Step>
            </StepList>
            <StepPanels>
                <StepPanel v-slot="{ activateCallback }" value="1" class="p-8">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">Create Your Account</h2>
                        <p class="text-gray-600">Let's get you started with DropBy</p>
                    </div>
                    <Fluid>
                        <div class="grid grid-cols-1 gap-4">
                            <div>
                                <FloatLabel variant="on">
                                    <InputText id="signup_email" v-model="signupEmail" type="email" @blur="() => { step1Touched = true; validateStep1() }" />
                                    <label for="signup_email">Email Address</label>
                                </FloatLabel>
                                <p v-if="step1Touched && step1Errors.email" class="text-red-500 text-xs mt-1">{{ step1Errors.email }}</p>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Password id="signup_password" v-model="signupPassword" @blur="() => { step1Touched = true; validateStep1() }" />
                                    <label for="signup_password">Password</label>
                                </FloatLabel>
                                <p v-if="step1Touched && step1Errors.password" class="text-red-500 text-xs mt-1">{{ step1Errors.password }}</p>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Password id="confirm_password" v-model="confirmPassword" @blur="() => { step1Touched = true; validateStep1() }" />
                                    <label for="confirm_password">Confirm Password</label>
                                </FloatLabel>
                                <p v-if="step1Touched && step1Errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ step1Errors.confirmPassword }}</p>
                            </div>
                        </div>
                    </Fluid>
                    <div class="flex justify-end">
                        <Button
                            label="Create Account"
                            :disabled="!step1Valid || accountCreating"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            @click="createAccount(activateCallback)"
                            :loading="accountCreating"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="2" class="p-8">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">What type of business are you?</h2>
                        <p class="text-gray-600">This helps us customize your experience</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Card
                                class="h-full cursor-pointer transition-all duration-200"
                                :class="[
                                    type === 'merchant' ? 'ring-4 ring-orange-500 bg-orange-200/30 shadow-2xl scale-105 border-2 border-orange-500' : 'hover:ring-2 hover:ring-orange-300 hover:bg-orange-50/5 hover:shadow',
                                ]"
                                @click="type = 'merchant'"
                            >
                                <template #title>
                                    <div class="text-xl font-semibold mb-2">Merchant</div>
                                </template>
                                <template #content>
                                    <p class="text-gray-600">
                                        Select this option if you are an employee or owner of a physical business.
                                        You must have a physical location and a business license in order to be approved 
                                        for food trucks to begin setting up at your place of business.
                                    </p>
                                </template>
                            </Card>
                        </div>
                        <div>
                            <Card
                                class="h-full cursor-pointer transition-all duration-200"
                                :class="[
                                    type === 'vendor' ? 'ring-4 ring-orange-500 bg-orange-200/30 shadow-2xl scale-105 border-2 border-orange-500' : 'hover:ring-2 hover:ring-orange-300 hover:bg-orange-50/5 hover:shadow',
                                ]"
                                @click="type = 'vendor'"
                            >
                                <template #title>
                                    <div class="text-xl font-semibold mb-2">Vendor</div>
                                </template>
                                <template #content>
                                    <p class="text-gray-600">
                                        Select this option if you are an employee or owner of a food truck business.
                                        You must have a valid business license in order to be approved and begin setting up
                                        at breweries, and other establishments in the area.
                                    </p>
                                </template>
                            </Card>
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                        <Button
                            :label="!type ? 'Continue' : `Continue as ${type.charAt(0).toUpperCase() + type.slice(1)}`"
                            :disabled="!type"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            @click="activateCallback('3')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="3" class="p-8">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">Tell us about yourself</h2>
                        <p class="text-gray-600">Primary contact information</p>
                    </div>
                    <div class="flex flex-col">
                        <Fluid>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="first_name" v-model="first" @blur="validateStep3" />
                                        <label for="first_name">First Name</label>
                                    </FloatLabel>
                                    <p v-if="step3Errors.first" class="text-red-500 text-xs mt-1">{{ step3Errors.first }}</p>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="last_name" v-model="last" @blur="validateStep3" />
                                        <label for="last_name">Last Name</label>
                                    </FloatLabel>
                                    <p v-if="step3Errors.last" class="text-red-500 text-xs mt-1">{{ step3Errors.last }}</p>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="email" v-model="email" disabled />
                                        <label for="email">Email</label>
                                    </FloatLabel>
                                    <p v-if="step3Errors.email" class="text-red-500 text-xs mt-1">{{ step3Errors.email }}</p>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputMask id="phone" v-model="phone" mask="(999) 999-9999" @blur="validateStep3" />
                                        <label for="phone">Phone</label>
                                    </FloatLabel>
                                    <p v-if="step3Errors.phone" class="text-red-500 text-xs mt-1">{{ step3Errors.phone }}</p>
                                </div>
                                <div class="card flex justify-center">
                                    <InputSwitch v-model="isAdmin" :disabled="true" class="mt-2" />
                                </div>
                                <div class="card flex justify-center">
                                    <InputSwitch v-model="available" class="mt-2" />
                                </div>
                            </div>
                        </Fluid>
                    </div>
                    <div class="flex justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                        <Button
                            label="Next"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            :disabled="!step3Valid"
                            @click="activateCallback('4')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="4" class="p-8">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">Business Information</h2>
                        <p class="text-gray-600">Tell us about your {{ type }}</p>
                    </div>
                    <div v-if="type" class="flex flex-col">
                        <NewBusiness @objUpdated="objUpdated" :bizType="type" />
                    </div>
                    <div class="flex justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                        <Button
                            label="Review"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            :disabled="!step4Valid"
                            @click="activateCallback('5')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="5" class="p-8">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">Review Your Information</h2>
                        <p class="text-gray-600">Please review before submitting</p>
                    </div>
                    
                    <div class="bg-gray-50 p-6 rounded-lg mb-6">
                        <h4 class="text-xl font-bold mb-4">Primary User</h4>
                    <p class="m-2"><span class="font-bold">Name: </span>{{ first }} {{ last }}</p>
                    <p class="m-2"><span class="font-bold">Email: </span>{{ email }}</p>
                    <p class="m-2"><span class="font-bold">Phone: </span>{{ phone }}</p>
                    <p class="m-2"><span class="font-bold">Available for contact: </span>
                        {{ available ? 'Yes' : 'No' }}
                    </p>
                    </div>

                    <div class="bg-gray-50 p-6 rounded-lg mb-6">
                        <h4 class="text-xl font-bold mb-4">{{ type }} Information</h4>
                    <p class="m-2"><span class="font-bold">Name: </span>{{ bizName }}</p>
                    <p class="m-2"><span class="font-bold">Description: </span>{{ bizDesc ? bizDesc : '-' }}</p>
                    <p class="m-2"><span class="font-bold">Website: </span>{{ website ? website : '-'}}</p>
                    <p class="m-2"><span class="font-bold">Instagram: </span>{{ ig ? ig : '-' }}</p>
                    <p class="m-2"><span class="font-bold">Phone: </span>{{ bizEmail }}</p>
                    <p class="m-2"><span class="font-bold">Email: </span>{{ bizPhone }}</p>
                    </div>

                    <div class="flex justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('4')" />
                        <Button label="Complete Setup" @click="submit" :loading="submitting" />
                    </div>
                </StepPanel>
            </StepPanels>
        </Stepper>

        <ErrorDialog v-if="errDialog" :errType="errType" :errMsg="errMsg" @errorClose="errDialog = false" />
    </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const supabase = useSupabaseClient()
const authUser = useSupabaseUser()

// Step 1: Account Setup
const signupEmail = ref('')
const signupPassword = ref('')
const confirmPassword = ref('')
const accountCreating = ref(false)
const step1Touched = ref(false)

// Step 2: Business Type
const type = ref<'vendor' | 'merchant' | null>(null)

// Step 3: User Information
const first = ref('')
const last = ref('')
const email = ref('')
const phone = ref('')
const isAdmin = ref(true)
const available = ref(true)

// Step 4: Business Information
const bizName = ref('')
const bizDesc = ref('')
const website = ref('')
const ig = ref('')
const bizEmail = ref('')
const bizPhone = ref('')
const imageUrl = ref('https://ionicframework.com/docs/img/demos/card-media.png')

// Vendor specific
const cuisine = ref<string[]>([])

// Merchant specific
const addressComponents = ref<any[]>([])
const coordinates = ref<{lat?: number, lng?: number}>({})
const formattedAddress = ref('')
const addressUrl = ref('')

// UI State
const submitting = ref(false)
const snackbar = ref(false)
const snacktext = ref('')
const errType = ref('')
const errMsg = ref('')
const errDialog = ref(false)

// Validation errors
const step1Errors = ref<Record<string, string>>({})
const step3Errors = ref<Record<string, string>>({})
const step4Errors = ref<Record<string, string>>({})

// Zod schemas
const step1Schema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

const step3Schema = z.object({
    first: z.string().min(1, 'First name is required'),
    last: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format. Use (555) 555-5555')
})

const step4Schema = z.object({
    name: z.string().min(1, 'Business name is required'),
    desc: z.string().min(1, 'Description is required'),
    email: z.string().min(1, 'Business email is required').email('Invalid email format'),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format. Use (555) 555-5555')
})

// Validation functions
const validateStep1 = () => {
    step1Touched.value = true
    try {
        step1Schema.parse({
            email: signupEmail.value,
            password: signupPassword.value,
            confirmPassword: confirmPassword.value
        })
        step1Errors.value = {}
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            step1Errors.value = {}
            error.errors.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                step1Errors.value[field] = err.message
            })
        }
    }
}

const validateStep3 = () => {
    try {
        step3Schema.parse({
            first: first.value,
            last: last.value,
            email: email.value,
            phone: phone.value
        })
        step3Errors.value = {}
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            step3Errors.value = {}
            error.errors.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                step3Errors.value[field] = err.message
            })
        }
    }
}

const validateStep4 = () => {
    try {
        step4Schema.parse({
            name: bizName.value,
            desc: bizDesc.value,
            email: bizEmail.value,
            phone: bizPhone.value
        })
        step4Errors.value = {}
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            step4Errors.value = {}
            error.errors.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                step4Errors.value[field] = err.message
            })
        }
    }
}

// Step validation computed properties
const step1Valid = computed(() => {
    if (step1Touched.value) {
        validateStep1()
    }
    return Object.keys(step1Errors.value).length === 0
})

const step3Valid = computed(() => {
    validateStep3()
    return Object.keys(step3Errors.value).length === 0
})

const step4Valid = computed(() => {
    validateStep4()
    return Object.keys(step4Errors.value).length === 0
})

// Methods
const createAccount = async (activateCallback?: Function) => {
    if (!step1Valid.value) return
    
    accountCreating.value = true
    try {
        const { data, error } = await supabase.auth.signUp({
            email: signupEmail.value,
            password: signupPassword.value
        })
        
        if (error) {
            throwErr('Account Creation', error.message)
        } else if (data.user) {
            // Set email for next step
            email.value = signupEmail.value
            snackbar.value = true
            snacktext.value = 'Account created successfully! Please check your email for verification.'
            if (activateCallback) activateCallback('2') // Move to next step
        }
    } catch (err) {
        console.error('Account creation error:', err)
        throwErr('Account Creation', 'Failed to create account. Please try again.')
    } finally {
        accountCreating.value = false
    }
}

const objUpdated = (obj: any) => {
    bizName.value = obj.name || ''
    bizDesc.value = obj.desc || ''
    bizPhone.value = obj.phone || ''
    bizEmail.value = obj.email || ''
    website.value = obj.website || ''
    ig.value = obj.ig || ''
    cuisine.value = obj.cuisine || []
    addressComponents.value = obj.addressComponents || []
    coordinates.value = obj.coordinates || {}
    formattedAddress.value = obj.formattedAddress || ''
    addressUrl.value = obj.addressUrl || ''
    imageUrl.value = obj.imageUrl || ''
}

const submit = async () => {
    if (!authUser.value?.id || !type.value) {
        throwErr('Submission Error', 'Missing required information')
        return
    }

    submitting.value = true
    const userId = authUser.value.id
    const typeId = uuidv4()

    try {
        // Create user in database
    const userObj = {
        id: userId,
            created_at: new Date().toISOString(),
        first_name: first.value,
        last_name: last.value,
        email: email.value,
        phone: phone.value,
        is_admin: isAdmin.value,
        type: type.value,
        associated_merchant_id: type.value === 'merchant' ? typeId : null,
        associated_vendor_id: type.value === 'vendor' ? typeId : null,
        available_to_contact: available.value
    }

        const { error: userErr } = await supabase.from('users').insert(userObj as any)
        
        if (userErr) {
            throwErr('User Creation', userErr.message)
            return
        }

        // Create business record
        const businessObj = {
            id: typeId,
            created_at: new Date().toISOString(),
            [`${type.value}_name`]: bizName.value,
            [`${type.value}_description`]: bizDesc.value,
            website: website.value,
            instagram: ig.value,
            phone: bizPhone.value,
            email: bizEmail.value,
            avatar_url: imageUrl.value
        }

        // Add type-specific fields
        if (type.value === 'merchant') {
            Object.assign(businessObj, {
                address_components: addressComponents.value,
                coordinates: coordinates.value,
                formatted_address: formattedAddress.value,
                address_url: addressUrl.value
            })
        } else if (type.value === 'vendor') {
            Object.assign(businessObj, {
                cuisine: cuisine.value
            })
        }

        const { error: businessErr } = await supabase.from(`${type.value}s`).insert(businessObj as any)
        
        if (businessErr) {
            throwErr('Business Creation', businessErr.message)
            return
        }

        // Get the business's stripe_customer_id if it exists
        let stripeCustomerId: string | null = null
        try {
            const { data: businessData } = await supabase
                .from(`${type.value}s`)
                .select('stripe_customer_id')
                .eq('id', typeId)
                .single()

            stripeCustomerId = businessData?.stripe_customer_id || null
        } catch (error: any) {
            console.error('Error getting business stripe_customer_id:', error)
            // Continue without Stripe customer ID for free subscription
        }

        // Create free subscription for the new business
        const { createFreeSubscription } = useSubscription()
        const { data: subscriptionData, error: subscriptionErr } = await createFreeSubscription(
            typeId, 
            type.value, 
            userId, 
            stripeCustomerId || undefined
        )

        if (subscriptionErr) {
            console.error('Failed to create free subscription:', subscriptionErr)
            // Don't fail the whole operation if subscription creation fails
            // The business was created successfully
        } else if (subscriptionData?.id) {
            // Update business with subscription ID
            await supabase
                .from(`${type.value}s`)
                .update({ subscription_id: subscriptionData.id } as any)
                .eq('id', typeId)
        }

        // Success
            snackbar.value = true
            snacktext.value = `${type.value} Created! An email confirmation has been sent. You will now be redirected.`
        
        // Redirect to business dashboard
        await navigateTo(`/${type.value}/${typeId}/dashboard`)
        
    } catch (err) {
        console.error('Submission error:', err)
        throwErr('Submission Error', 'An unexpected error occurred')
    } finally {
    submitting.value = false
}
}

const throwErr = (title: string, msg: string) => {
    errType.value = title
    errMsg.value = msg
    errDialog.value = true
}
</script>

<style scoped>

</style>