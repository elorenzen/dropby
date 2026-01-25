<template>
    <div class="card flex justify-center" style="background-color: var(--p-surface-ground) !important;">
        <Stepper :value="currentStep" class="basis-[60rem]" style="background-color: var(--p-surface-ground) !important;">
            <StepList>
                <Step value="1">Business Type</Step>
                <Step value="2" :disabled="!step1Valid">Primary User Information</Step>
                <Step value="3" :disabled="!step1Valid || !step2Valid">Business Information</Step>
                <Step value="4" :disabled="!step1Valid || !step2Valid || !step3Valid">Choose Plan</Step>
                <Step value="5" :disabled="!step1Valid || !step2Valid || !step3Valid || !step4Valid">Review</Step>
            </StepList>
            <StepPanels>
                <StepPanel v-slot="{ activateCallback }" value="1" class="p-8 bg-surface-ground" style="background-color: var(--p-surface-ground) !important; background: var(--p-surface-ground) !important;">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">What type of business are you?</h2>
                        <p class="text-color-secondary">This helps us customize your experience</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Card
                                class="h-full cursor-pointer transition-all duration-200"
                                :class="[
                                    type === 'merchant' ? 'border-primary bg-primary-light shadow-lg scale-105' : 'hover:border-primary-light hover:bg-primary-light hover:shadow',
                                ]"
                                @click="type = 'merchant'"
                            >
                                <template #title>
                                    <div class="text-xl font-semibold mb-2">Merchant</div>
                                </template>
                                <template #content>
                                    <p class="text-color-secondary">
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
                                    type === 'vendor' ? 'border-primary bg-primary-light shadow-lg scale-105' : 'hover:border-primary-light hover:bg-primary-light hover:shadow',
                                ]"
                                @click="type = 'vendor'"
                            >
                                <template #title>
                                    <div class="text-xl font-semibold mb-2">Vendor</div>
                                </template>
                                <template #content>
                                    <p class="text-color-secondary">
                                        Select this option if you are an employee or owner of a food truck business.
                                        You must have a valid business license in order to be approved and begin setting up
                                        at breweries, and other establishments in the area.
                                    </p>
                                </template>
                            </Card>
                        </div>
                    </div>
                    <div class="flex justify-end" style="margin-top: 3rem; padding-top: 2rem;">
                        <Button
                            :label="!type ? 'Continue' : `Continue as ${type.charAt(0).toUpperCase() + type.slice(1)}`"
                            :disabled="!type"
                            severity="secondary"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            @click="activateCallback('2')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="2" class="p-8 bg-surface-ground" style="background-color: var(--p-surface-ground) !important; background: var(--p-surface-ground) !important;">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">Tell us about yourself</h2>
                        <p class="text-color-secondary">Primary contact information</p>
                    </div>
                    <div class="flex flex-col">
                        <Fluid>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="first_name" v-model="first" @blur="validateStep2" />
                                        <label for="first_name">First Name</label>
                                    </FloatLabel>
                                    <p v-if="step2Errors.first" class="text-error text-xs mt-1">{{ step2Errors.first }}</p>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="last_name" v-model="last" @blur="validateStep2" />
                                        <label for="last_name">Last Name</label>
                                    </FloatLabel>
                                    <p v-if="step2Errors.last" class="text-error text-xs mt-1">{{ step2Errors.last }}</p>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="email" v-model="email" type="email" @blur="validateStep2" />
                                        <label for="email">Email</label>
                                    </FloatLabel>
                                    <p v-if="step2Errors.email" class="text-error text-xs mt-1">{{ step2Errors.email }}</p>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <InputMask id="phone" v-model="phone" mask="(999) 999-9999" @blur="validateStep2" />
                                        <label for="phone">Phone</label>
                                    </FloatLabel>
                                    <p v-if="step2Errors.phone" class="text-error text-xs mt-1">{{ step2Errors.phone }}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mt-4">
                                <div class="flex items-center gap-3">
                                    <label class="text-color">Is Admin</label>
                                    <InputSwitch v-model="isAdmin" :disabled="true" />
                                </div>
                                <div class="flex items-center gap-3">
                                    <label class="text-color">Available for Contact</label>
                                    <InputSwitch v-model="available" />
                                </div>
                            </div>
                        </Fluid>
                    </div>
                    <div class="flex justify-between" style="margin-top: 3rem; padding-top: 2rem;">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                        <Button
                            label="Next"
                            severity="secondary"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            :disabled="!step2Valid"
                            @click="activateCallback('3')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="3" class="p-8 bg-surface-ground" style="background-color: var(--p-surface-ground) !important; background: var(--p-surface-ground) !important;">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">Business Information</h2>
                        <p class="text-color-secondary">Tell us about your {{ type }}</p>
                    </div>
                    <div v-if="type" class="flex flex-col">
                        <NewBusiness @objUpdated="objUpdated" :bizType="type" />
                    </div>
                    <div class="flex justify-between" style="margin-top: 3rem; padding-top: 2rem;">
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
                <StepPanel v-slot="{ activateCallback }" value="4" class="p-8 bg-surface-ground" style="background-color: var(--p-surface-ground) !important; background: var(--p-surface-ground) !important;">
                    <div v-if="type" class="plan-selection-container">
                        <div class="text-center mb-6">
                            <h2 class="text-3xl font-bold text-color mb-2">Choose Your Plan</h2>
                            <p class="text-md-gray">Select the perfect plan for your business needs</p>
                        </div>

                        <div class="plans-grid">
                            <div 
                                v-for="plan in availablePlans" 
                                :key="plan.id"
                                class="plan-card"
                                :class="{ 
                                    'featured': plan.featured,
                                    'selected': selectedPlan?.id === plan.id
                                }"
                                @click="handlePlanSelection(plan)"
                            >
                                <div class="plan-header">
                                    <h4>{{ plan.name }}</h4>
                                    <p>{{ plan.description }}</p>
                                </div>

                                <div class="plan-divider" />
                                
                                <div class="plan-price">
                                    <span class="price">${{ plan.price }}</span>
                                    <span class="period">per month</span>
                                </div>
                                
                                <div class="plan-divider" />
                                
                                <ul class="plan-features">
                                    <li v-for="feature in plan.features" :key="feature">
                                        <i class="pi pi-check-circle icon-success" />
                                        <span>{{ feature }}</span>
                                    </li>
                                </ul>
                                
                                <Button 
                                    :label="selectedPlan?.id === plan.id ? 'Selected' : plan.buttonText"
                                    rounded
                                    class="plan-button"
                                    :disabled="selectedPlan?.id === plan.id"
                                    @click.stop="handlePlanSelection(plan)"
                                />
                            </div>
                        </div>

                        <p v-if="step4Errors.selectedPlan" class="text-error text-sm mt-4 text-center">
                            {{ step4Errors.selectedPlan }}
                        </p>
                    </div>
                    <div class="flex justify-between" style="margin-top: 3rem; padding-top: 2rem;">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                        <Button
                            label="Continue to Review"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            :disabled="!step4Valid"
                            @click="activateCallback('5')"
                        />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="5" class="p-8 bg-surface-ground" style="background-color: var(--p-surface-ground) !important; background: var(--p-surface-ground) !important;">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-4">Review Your Information</h2>
                        <p class="text-color-secondary">Please review before submitting</p>
                    </div>
                    
                    <div class="bg-surface-section p-6 rounded-lg mb-6">
                        <h4 class="text-xl font-bold mb-4">Primary User</h4>
                        <p class="m-2"><span class="font-bold">Name: </span>{{ first }} {{ last }}</p>
                        <p class="m-2"><span class="font-bold">Email: </span>{{ email }}</p>
                        <p class="m-2"><span class="font-bold">Phone: </span>{{ phone }}</p>
                        <p class="m-2"><span class="font-bold">Available for contact: </span>
                            {{ available ? 'Yes' : 'No' }}
                        </p>
                    </div>

                    <div class="bg-surface-section p-6 rounded-lg mb-6">
                        <h4 class="text-xl font-bold mb-4">{{ type }} Information</h4>
                        <p class="m-2"><span class="font-bold">Name: </span>{{ bizName }}</p>
                        <p class="m-2"><span class="font-bold">Description: </span>{{ bizDesc ? bizDesc : '-' }}</p>
                        <p class="m-2"><span class="font-bold">Website: </span>{{ website ? website : '-'}}</p>
                        <p class="m-2"><span class="font-bold">Instagram: </span>{{ ig ? ig : '-' }}</p>
                        <p class="m-2"><span class="font-bold">Phone: </span>{{ bizEmail }}</p>
                        <p class="m-2"><span class="font-bold">Email: </span>{{ bizPhone }}</p>
                    </div>

                    <div v-if="selectedPlan" class="bg-surface-section p-6 rounded-lg mb-6">
                        <h4 class="text-xl font-bold mb-4">Selected Plan</h4>
                        <p class="m-2"><span class="font-bold">Plan: </span>{{ selectedPlan.name }}</p>
                        <p class="m-2"><span class="font-bold">Price: </span>${{ selectedPlan.price }}/month</p>
                        <p class="m-2" v-if="selectedPlan.price === 0">
                            <span class="font-bold">Status: </span>Free plan selected
                        </p>
                        <p class="m-2" v-else>
                            <span class="font-bold">Status: </span>Payment will be collected after account creation
                        </p>
                    </div>

                    <div class="border-t pt-6 mt-6">
                        <h4 class="text-xl font-bold mb-4">Create Your Account</h4>
                        <p class="text-color-secondary mb-4">Set a password to complete your registration</p>
                        <Fluid>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <FloatLabel variant="on">
                                        <InputText id="signup_email" :model-value="signupEmail" type="email" disabled />
                                        <label for="signup_email">Email Address</label>
                                    </FloatLabel>
                                </div>
                                <div></div>
                                <div>
                                    <FloatLabel variant="on">
                                        <Password id="signup_password" v-model="signupPassword" @blur="() => { step5Touched = true; validateStep5() }" />
                                        <label for="signup_password">Password</label>
                                    </FloatLabel>
                                    <p v-if="step5Touched && step5Errors.password" class="text-error text-xs mt-1">{{ step5Errors.password }}</p>
                                </div>
                                <div>
                                    <FloatLabel variant="on">
                                        <Password id="confirm_password" v-model="confirmPassword" @blur="() => { step5Touched = true; validateStep5() }" />
                                        <label for="confirm_password">Confirm Password</label>
                                    </FloatLabel>
                                    <p v-if="step5Touched && step5Errors.confirmPassword" class="text-error text-xs mt-1">{{ step5Errors.confirmPassword }}</p>
                                </div>
                            </div>
                        </Fluid>
                    </div>

                    <div class="flex justify-between" style="margin-top: 3rem; padding-top: 2rem;">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('4')" />
                        <Button 
                            label="Complete Setup" 
                            icon="pi pi-check"
                            iconPos="right"
                            @click="submit" 
                            :loading="submitting" 
                            :disabled="!step5Valid" 
                        />
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
import { merchantPlans, vendorPlans, type Plan } from '~/constants/subscriptionPlans'

const supabase = useSupabaseClient()
const authUser = useSupabaseUser()
const route = useRoute()

// Step 1: Business Type
const type = ref<'vendor' | 'merchant' | null>(null)

// Step 4: Subscription Plan Selection (declared early for use in watch)
const selectedPlan = ref<any>(null)

// Handle query params on mount and route changes
watch(() => route.query, (query: Record<string, any>) => {
    // Set business type from query param
    if (query.businessType === 'merchant' || query.businessType === 'vendor') {
        type.value = query.businessType as 'merchant' | 'vendor'
    }
    
    // Set plan from query param (use businessType from query if type.value not set yet)
    if (query.plan) {
        const businessType = type.value || query.businessType
        if (businessType === 'merchant' || businessType === 'vendor') {
            const planParam = query.plan as string
            const plans = businessType === 'merchant' ? merchantPlans : vendorPlans
            const plan = plans.find(p => p.id === planParam || p.id === `${businessType}-${planParam}`)
            if (plan) {
                selectedPlan.value = plan
            }
        }
    }
}, { immediate: true })

// Step 2: User Information
const first = ref('')
const last = ref('')
const email = ref('')
const phone = ref('')
const isAdmin = ref(true)
const available = ref(true)

// Step 3: Business Information
const bizName = ref('')
const bizDesc = ref('')
const website = ref('')
const ig = ref('')
const bizEmail = ref('')
const bizPhone = ref('')
const imageUrl = ref('https://ionicframework.com/docs/img/demos/card-media.png')

// Stepper current step - defaults to 1, but starts at 2 if businessType is provided
const currentStep = computed(() => {
    if (route.query.businessType) {
        return '2'
    }
    return '1'
})

// Step 5: Review & Account Setup (password only, email pre-filled)
const signupEmail = computed(() => email.value) // Pre-filled from Step 2
const signupPassword = ref('')
const confirmPassword = ref('')
const step5Touched = ref(false)

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
const step2Errors = ref<Record<string, string>>({})
const step3Errors = ref<Record<string, string>>({})
const step4Errors = ref<Record<string, string>>({})
const step5Errors = ref<Record<string, string>>({})

// Zod schemas
const step1Schema = z.object({
    type: z.enum(['merchant', 'vendor'], {
        errorMap: () => ({ message: 'Please select a business type' })
    })
})

const step2Schema = z.object({
    first: z.string().min(1, 'First name is required'),
    last: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format. Use (555) 555-5555')
})

const step3Schema = z.object({
    name: z.string().min(1, 'Business name is required'),
    desc: z.string().min(1, 'Description is required'),
    email: z.string().min(1, 'Business email is required').email('Invalid email format'),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format. Use (555) 555-5555')
})

const step4Schema = z.object({
    selectedPlan: z.any().refine((val: any) => val !== null && val !== undefined, {
        message: 'Please select a subscription plan'
    })
})

const step5Schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

// Validation functions
const validateStep1 = () => {
    try {
        step1Schema.parse({
            type: type.value
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

const validateStep2 = () => {
    try {
        step2Schema.parse({
            first: first.value,
            last: last.value,
            email: email.value,
            phone: phone.value
        })
        step2Errors.value = {}
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            step2Errors.value = {}
            error.errors.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                step2Errors.value[field] = err.message
            })
        }
    }
}

const validateStep3 = () => {
    try {
        step3Schema.parse({
            name: bizName.value,
            desc: bizDesc.value,
            email: bizEmail.value,
            phone: bizPhone.value
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
            selectedPlan: selectedPlan.value
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

const validateStep5 = () => {
    step5Touched.value = true
    try {
        step5Schema.parse({
            password: signupPassword.value,
            confirmPassword: confirmPassword.value
        })
        step5Errors.value = {}
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            step5Errors.value = {}
            error.errors.forEach((err: z.ZodIssue) => {
                const field = err.path[0] as string
                step5Errors.value[field] = err.message
            })
        }
    }
}

// Step validation computed properties
const step1Valid = computed(() => {
    validateStep1()
    return Object.keys(step1Errors.value).length === 0
})

const step2Valid = computed(() => {
    validateStep2()
    return Object.keys(step2Errors.value).length === 0
})

const step3Valid = computed(() => {
    validateStep3()
    return Object.keys(step3Errors.value).length === 0
})

const step4Valid = computed(() => {
    // Access selectedPlan.value to track the dependency
    const plan = selectedPlan.value
    validateStep4()
    return Object.keys(step4Errors.value).length === 0 && plan !== null && plan !== undefined
})

const step5Valid = computed(() => {
    if (step5Touched.value) {
        validateStep5()
    }
    return Object.keys(step5Errors.value).length === 0
})

// Available plans based on type
const availablePlans = computed(() => {
    return type.value === 'merchant' ? merchantPlans : vendorPlans
})

// Methods
const handlePlanSelection = (plan: Plan) => {
    console.log('Plan selected:', plan)
    // During onboarding, we just store the plan selection
    // Payment will be collected after account creation
    selectedPlan.value = plan
    // Validate step 4 when a plan is selected
    validateStep4()
    console.log('Selected plan value:', selectedPlan.value)
    console.log('Step 4 valid:', step4Valid.value)
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
    if (!type.value) {
        throwErr('Submission Error', 'Missing required information')
        return
    }

    submitting.value = true
    const typeId = uuidv4()

    try {
        // Create account first to get user ID
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.value, // Use email from Step 2
            password: signupPassword.value
        })
        
        if (authError) {
            throwErr('Account Creation', authError.message)
            submitting.value = false
            return
        }
        
        if (!authData.user?.id) {
            throwErr('Account Creation', 'Failed to create account')
            submitting.value = false
            return
        }
        
        const userId = authData.user.id
        
        // Sync email value
        email.value = signupEmail.value
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
        const userStore = useUserStore()
        const userData = await userStore.createUser(userObj)
        
        if (!userData) {
            throwErr('User Creation', 'Failed to create user')
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

        let businessData
        if (type.value === 'merchant') {
            const merchantStore = useMerchantStore()
            businessData = await merchantStore.createMerchant(businessObj)
        } else if (type.value === 'vendor') {
            const vendorStore = useVendorStore()
            businessData = await vendorStore.createVendor(businessObj)
        }
        
        if (!businessData) {
            throwErr('Business Creation', 'Failed to create business')
            return
        }

        // Get the business's stripe_customer_id if it exists
        // The business was just created, so get it from the returned data
        let stripeCustomerId: string | null = null
        try {
            if (businessData) {
                stripeCustomerId = (businessData as any).stripe_customer_id || null
            }
        } catch (error: any) {
            console.error('Error getting business stripe_customer_id:', error)
            // Continue without Stripe customer ID for free subscription
        }

        // Create subscription based on selected plan
        let subscriptionData: any = null
        let subscriptionErr: any = null

        if (selectedPlan.value && selectedPlan.value.price > 0) {
            // Create paid subscription with allow_incomplete (no payment method yet)
            // This creates a subscription with status 'incomplete'/'unpaid' in Stripe
            try {
                const response = await $fetch('/api/subscriptions/create', {
                    method: 'POST',
                    body: {
                        planType: selectedPlan.value.id,
                        stripePriceId: selectedPlan.value.stripePriceId
                        // No paymentMethodId - this creates an incomplete/unpaid subscription
                    }
                }) as any
                
                if (response.success) {
                    subscriptionData = response.subscription
                } else {
                    subscriptionErr = new Error('Failed to create subscription')
                }
            } catch (error: any) {
                console.error('Error creating paid subscription:', error)
                subscriptionErr = error
            }
        } else {
            // Create free subscription
            const { createFreeSubscription } = useSubscription()
            const { data, error } = await createFreeSubscription(
                typeId, 
                type.value, 
                userId, 
                stripeCustomerId || undefined
            )
            subscriptionData = data
            subscriptionErr = error
        }

        if (subscriptionErr) {
            console.error('Failed to create subscription:', subscriptionErr)
            // Don't fail the whole operation if subscription creation fails
            // The business was created successfully
        } else if (subscriptionData?.id) {
            // Update business with subscription ID using store action
            if (type.value === 'merchant') {
                const merchantStore = useMerchantStore()
                await merchantStore.updateMerchant(typeId, { subscription_id: subscriptionData.id })
            } else if (type.value === 'vendor') {
                const vendorStore = useVendorStore()
                await vendorStore.updateVendor(typeId, { subscription_id: subscriptionData.id })
            }
        }

        // Success
        snackbar.value = true
        snacktext.value = `${type.value} Created! An email confirmation has been sent.`
        
        // Always redirect to homepage - payment will be collected after sign-in
        await navigateTo('/')
        
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
/* Force dark background on StepPanels - NUCLEAR OPTION */
:deep(.p-stepper),
:deep(.p-stepper *),
:deep(.p-stepper-panel),
:deep(.p-stepper-panel *),
:deep(.p-stepper-panel-content),
:deep(.p-stepper-panel-content *),
:deep(.p-stepper .p-stepper-panel),
:deep(.p-stepper .p-stepper-panel *),
:deep([data-pc-section="content"]),
:deep([data-pc-section="content"] *),
:deep([data-pc-name="stepperpanel"]),
:deep([data-pc-name="stepperpanel"] *) {
    background-color: var(--p-surface-ground) !important;
    background: var(--p-surface-ground) !important;
}

/* Target ALL possible PrimeVue StepPanel elements */
:deep(.p-stepper .p-stepper-panel > div),
:deep(.p-stepper .p-stepper-panel > div > div),
:deep(.p-stepper-panel[data-p-panel]),
:deep(.p-stepper .p-stepper-panels),
:deep(.p-stepper .p-stepper-panels *) {
    background-color: var(--p-surface-ground) !important;
    background: var(--p-surface-ground) !important;
}

/* Override any white or light backgrounds specifically */
:deep(.p-stepper),
:deep(.p-stepper-panel),
:deep(.p-stepper-panel-content),
:deep([data-pc-section="content"]),
:deep(.p-stepper-panels),
:deep(.p-stepper-panels *) {
    background-color: var(--p-surface-ground) !important;
    background: var(--p-surface-ground) !important;
}

/* Plan Selection Styles */
.plan-selection-container {
    max-width: 80rem;
    margin: 0 auto;
}

.plans-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 2rem;
}

@media (max-width: 768px) {
    .plans-grid {
        grid-template-columns: 1fr;
    }
}

.plans-grid .plan-card {
    min-width: 0;
}

.plan-card {
    background: var(--p-surface-card);
    padding: 2rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    border: 1px solid var(--p-surface-border);
    transition: all 0.3s ease;
    cursor: pointer;
}

.plan-card.selected {
    border: 2px solid var(--primary-color) !important;
}

.plan-card.featured:not(.selected) {
    border: 1px solid var(--p-surface-border);
    box-shadow: none;
}

.plan-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 40px 0 rgba(0,0,0,0.55);
    border-color: var(--primary-color);
}

.plan-header h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--heading-color);
}

.plan-header p {
    color: var(--text-color-secondary);
    line-height: 1.6;
}

.plan-divider {
    width: 100%;
    height: 1px;
    background: var(--p-surface-border);
}

.plan-price {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.plan-price .price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--heading-color);
}

.plan-price .period {
    font-size: 1rem;
    color: var(--text-color-secondary);
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.plan-features li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.plan-features .icon-success {
    color: var(--p-success-color);
    font-size: 1.125rem;
}

.plan-features span {
    line-height: 1.6;
}

.plan-button {
    width: 100%;
}

/* Fix InputSwitch/ToggleSwitch visibility - PrimeVue v4 uses p-toggleswitch */
:deep(.p-toggleswitch) {
    display: inline-block !important;
    width: 3rem !important;
    height: 1.75rem !important;
    visibility: visible !important;
    opacity: 1 !important;
}

:deep(.p-toggleswitch-slider) {
    background: var(--p-surface-400) !important;
    border: 1px solid var(--p-surface-400) !important;
    border-radius: 30px !important;
}

:deep(.p-toggleswitch-slider:before) {
    background: var(--p-surface-card) !important;
    width: 1.25rem !important;
    height: 1.25rem !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
    background: var(--p-primary-color) !important;
    border-color: var(--p-primary-color) !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider:before) {
    background: var(--p-primary-contrast-color, var(--p-surface-card)) !important;
    transform: translateX(1.25rem) !important;
}

</style>