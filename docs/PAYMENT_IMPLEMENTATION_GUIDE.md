# Payment System Implementation Guide

## Overview
This guide walks you through implementing the complete payment system for Dropby, including Stripe integration, subscription management, and usage tracking.

## Prerequisites

### 1. Stripe Account Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up webhook endpoints for payment events

### 2. Environment Variables
Add these to your `.env` file:
```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE=your_supabase_service_key
```

## Step 1: Install Dependencies

```bash
# Install Stripe packages
npm install stripe @stripe/stripe-js

# Install additional utilities
npm install @types/stripe
```

## Step 2: Database Setup

### Run the Payment Schema
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the contents of `database/payment_schema.sql`

### Verify Tables Created
```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'subscriptions', 'usage_tracking');
```

## Step 3: Stripe Configuration

### Create Stripe Products and Prices
In your Stripe Dashboard, create the following products:

#### Merchant Plans
```javascript
// Merchant Pro Plan
{
  name: "Merchant Pro",
  price: 2900, // $29.00 in cents
  interval: "month",
  currency: "usd"
}

// Merchant Enterprise Plan
{
  name: "Merchant Enterprise", 
  price: 9900, // $99.00 in cents
  interval: "month",
  currency: "usd"
}
```

#### Vendor Plans
```javascript
// Vendor Pro Plan
{
  name: "Vendor Pro",
  price: 1900, // $19.00 in cents
  interval: "month", 
  currency: "usd"
}

// Vendor Premium Plan
{
  name: "Vendor Premium",
  price: 4900, // $49.00 in cents
  interval: "month",
  currency: "usd"
}
```

### Set Up Webhooks
1. In Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

## Step 4: Frontend Integration

### Update Event Creation Flow
Modify your event creation to include payment value:

```vue
<!-- In your event creation form -->
<template>
  <div class="space-y-4">
    <!-- Existing event fields -->
    
    <!-- Payment Value Field -->
    <div>
      <label class="block text-sm font-medium text-text-main mb-2">
        Event Value ($)
      </label>
      <InputNumber
        v-model="eventValue"
        :min="0"
        :max="10000"
        :step="0.01"
        placeholder="Enter event value"
        class="w-full"
      />
      <p class="text-xs text-text-muted mt-1">
        This is the amount you'll pay to the vendor for this event
      </p>
    </div>
    
    <!-- Fee Breakdown - UPDATED STRUCTURE -->
    <div v-if="eventValue > 0" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 class="font-semibold text-text-main mb-2">Fee Breakdown</h4>
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span>Event Value (Vendor Payment):</span>
          <span>${{ eventValue.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Platform Fee (8%):</span>
          <span>${{ (eventValue * 0.08).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Processing Fee:</span>
          <span>${{ ((eventValue * 0.029) + 0.30).toFixed(2) }}</span>
        </div>
        <div class="border-t pt-1 mt-1">
          <div class="flex justify-between font-semibold">
            <span>Total (You Pay):</span>
            <span>${{ ((eventValue * 1.109) + 0.30).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Vendor Payment Info -->
      <div class="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-700 dark:text-blue-300">
          <i class="pi pi-info-circle mr-1"></i>
          The vendor will receive the full event value of ${{ eventValue.toFixed(2) }}
        </p>
      </div>
    </div>
  </div>
</template>
```

### Add Payment Dialog to Event Approval
Update your event approval flow to include payment:

```vue
<!-- In your event approval component -->
<template>
  <div>
    <!-- Existing approval UI -->
    
    <!-- Payment Dialog -->
    <PaymentDialog
      :visible="showPaymentDialog"
      :payment-data="paymentData"
      @update:visible="showPaymentDialog = $event"
      @payment-complete="onPaymentComplete"
    />
  </div>
</template>

<script setup>
const showPaymentDialog = ref(false)
const paymentData = ref({})

const approveRequest = async (event, vendorId) => {
  // Check subscription limits first
  const canCreateEvent = await checkSubscriptionLimit(user.value.id, 'events', 1)
  
  if (!canCreateEvent) {
    toast.add({
      severity: 'error',
      summary: 'Limit Reached',
      detail: 'You have reached your monthly event limit. Please upgrade your plan.',
      life: 5000
    })
    return
  }
  
  // Create payment intent with updated fee structure
  try {
    const response = await $fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      body: {
        eventId: event.id,
        amount: event.event_value || 100, // Default value
        merchantId: user.value.associated_merchant_id,
        vendorId: vendorId
      }
    })
    
    paymentData.value = response.paymentIntent
    showPaymentDialog.value = true
    
  } catch (error) {
    console.error('Payment creation failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Payment Error',
      detail: 'Failed to create payment. Please try again.',
      life: 3000
    })
  }
}

const onPaymentComplete = async () => {
  // Update event status to booked
  await approveEventRequest(selectedEvent.value, selectedVendor.value)
  showPaymentDialog.value = false
  
  toast.add({
    severity: 'success',
    summary: 'Payment Successful',
    detail: 'Event has been booked and payment completed!',
    life: 3000
  })
}
</script>
```

## Step 5: Subscription Management

### Create Subscription Page
```vue
<!-- pages/subscriptions.vue -->
<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-main mb-2">Subscription Plans</h1>
        <p class="text-text-muted">Choose the perfect plan for your business</p>
      </div>
      
      <SubscriptionPlans @plan-selected="handlePlanSelection" />
    </div>
  </div>
</template>

<script setup>
const handlePlanSelection = async (plan) => {
  if (plan.price === 0) {
    // Handle free plan
    await setFreePlan()
  } else {
    // Handle paid plan
    await createSubscription(plan)
  }
}

const createSubscription = async (plan) => {
  try {
    const response = await $fetch('/api/subscriptions/create', {
      method: 'POST',
      body: {
        planType: plan.id,
        stripePriceId: plan.stripePriceId
      }
    })
    
    // Redirect to Stripe checkout
    window.location.href = response.checkoutUrl
    
  } catch (error) {
    console.error('Subscription creation failed:', error)
  }
}
</script>
```

## Step 6: Usage Tracking

### Add Usage Checks
Create a composable for usage tracking:

```typescript
// composables/useSubscription.ts
export const useSubscription = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const checkUsage = async (usageType: 'events' | 'requests') => {
    const { data, error } = await supabase
      .rpc('check_subscription_limit', {
        user_id_param: user.value?.id,
        usage_type_param: usageType,
        required_count: 1
      })
    
    if (error) {
      console.error('Usage check failed:', error)
      return false
    }
    
    return data
  }
  
  const getCurrentUsage = async (usageType: 'events' | 'requests') => {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('usage_count')
      .eq('user_id', user.value?.id)
      .eq('usage_type', usageType)
      .gte('period_start', new Date().toISOString().slice(0, 7) + '-01')
      .single()
    
    if (error) return 0
    return data?.usage_count || 0
  }
  
  const getUsageLimit = (plan: string, usageType: 'events' | 'requests') => {
    const limits = {
      free: { events: 3, requests: 5 },
      pro: { events: 999999, requests: 999999 },
      premium: { events: 999999, requests: 999999 },
      enterprise: { events: 999999, requests: 999999 }
    }
    
    return limits[plan]?.[usageType] || 0
  }
  
  return {
    checkUsage,
    getCurrentUsage,
    getUsageLimit
  }
}
```

## Step 7: Testing

### Test Payment Flow
1. Create a test event with a payment value
2. Approve a vendor request
3. Complete payment with test card: `4242 4242 4242 4242`
4. Verify payment status updates in database
5. Check webhook events in Stripe Dashboard

### Test Subscription Flow
1. Select a paid plan
2. Complete checkout with test card
3. Verify subscription created in database
4. Test usage limits with free plan

### Test Webhooks
1. Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## Step 8: Production Deployment

### Security Checklist
- [ ] Enable Row Level Security (RLS) on all payment tables
- [ ] Set up proper CORS for webhook endpoints
- [ ] Use environment variables for all API keys
- [ ] Enable webhook signature verification
- [ ] Set up proper error logging

### Monitoring
- [ ] Set up Stripe Dashboard alerts
- [ ] Monitor payment success/failure rates
- [ ] Track subscription churn
- [ ] Monitor webhook delivery

### Compliance
- [ ] Ensure PCI compliance (handled by Stripe)
- [ ] Set up proper refund policies
- [ ] Create terms of service for payments
- [ ] Set up proper dispute handling

## Updated Fee Structure Examples

### Example 1: $500 Event
- **Event Value**: $500
- **Platform Fee (8%)**: $40 (our revenue)
- **Processing Fee**: $14.80 (Stripe fee)
- **Total Merchant Pays**: $554.80
- **Vendor Receives**: $500 (full amount)

### Example 2: $1,000 Event
- **Event Value**: $1,000
- **Platform Fee (8%)**: $80 (our revenue)
- **Processing Fee**: $29.30 (Stripe fee)
- **Total Merchant Pays**: $1,109.30
- **Vendor Receives**: $1,000 (full amount)

### Example 3: $2,500 Event
- **Event Value**: $2,500
- **Platform Fee (8%)**: $200 (our revenue)
- **Processing Fee**: $72.80 (Stripe fee)
- **Total Merchant Pays**: $2,772.80
- **Vendor Receives**: $2,500 (full amount)

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Fails**
   - Check webhook secret in environment variables
   - Verify webhook endpoint URL is correct

2. **Payment Intent Creation Fails**
   - Check Stripe API keys
   - Verify event and user IDs exist
   - Check database constraints

3. **Subscription Limits Not Working**
   - Verify usage tracking functions are called
   - Check subscription status in database
   - Ensure RLS policies allow function execution

### Debug Commands
```sql
-- Check payment status
SELECT * FROM payments WHERE event_id = 'your-event-id';

-- Check subscription status
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';

-- Check usage tracking
SELECT * FROM usage_tracking WHERE user_id = 'your-user-id';
```

## Next Steps

1. **Analytics Dashboard**: Create detailed payment analytics
2. **Refund System**: Implement automated refund processing
3. **Invoice Generation**: Add PDF invoice generation
4. **Multi-Currency**: Support for different currencies
5. **Tax Calculation**: Add tax calculation based on location
6. **Advanced Reporting**: Create comprehensive financial reports

This implementation provides a solid foundation for your payment system with a fair and transparent fee structure where vendors receive their full agreed-upon payment and merchants pay all associated fees. 