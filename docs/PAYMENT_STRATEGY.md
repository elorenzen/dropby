# Dropby Payment Strategy & Monetization

## Overview
Dropby is a marketplace connecting merchants (establishments) with vendors (food trucks) for events. This document outlines the recommended payment flow and monetization strategies.

## Revenue Models

### 1. **Transaction-Based Fees (Primary Revenue)**
- **Platform Fee**: 8% of each event booking value (our revenue)
- **Processing Fee**: 2.9% + $0.30 per transaction (Stripe fee, paid by merchant)
- **Total Fee**: ~11% of transaction value (merchant pays all fees)
- **Vendor Receives**: 100% of event value (no fees deducted from vendor)

### 2. **Subscription Tiers (Secondary Revenue)**

#### Merchant Subscriptions
- **Free Tier**: 3 events/month, basic features
- **Pro Tier**: $19/month - Unlimited events, priority support, analytics
- **Enterprise Tier**: $49/month - Custom integrations, dedicated support

#### Vendor Subscriptions  
- **Free Tier**: 5 event requests/month, basic profile
- **Pro Tier**: $29/month - Unlimited requests, featured placement, analytics
- **Premium Tier**: $79/month - Priority booking, custom branding, advanced analytics

### 3. **Premium Features (Tertiary Revenue)**
- **Featured Listings**: $5-10 per featured event
- **Promoted Profiles**: $15-25/month for top placement
- **Advanced Analytics**: $10/month per user
- **API Access**: $50/month for integrations

## Payment Flow Implementation

### Phase 1: Basic Transaction Fees

#### Database Schema Updates
```sql
-- Add payment-related tables
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  merchant_id UUID REFERENCES merchants(id),
  vendor_id UUID REFERENCES vendors(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  processing_fee DECIMAL(10,2) NOT NULL,
  vendor_payout DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_type VARCHAR(20) NOT NULL, -- 'free', 'pro', 'premium', 'enterprise'
  status VARCHAR(20) DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add payment fields to events table
ALTER TABLE events ADD COLUMN event_value DECIMAL(10,2);
ALTER TABLE events ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE events ADD COLUMN payment_id UUID REFERENCES payments(id);
```

#### Payment Flow Steps

1. **Event Creation** (Merchant)
   - Merchant sets event value/booking fee
   - Platform calculates fees (merchant pays all fees)
   - Event marked as "payment_required"

2. **Event Booking** (Vendor)
   - Vendor requests event
   - Merchant approves vendor
   - Payment intent created

3. **Payment Processing** (Merchant)
   - Merchant pays total amount (event value + platform fee + processing fee)
   - Payment held in escrow
   - Event status updated to "paid"

4. **Event Completion**
   - Event occurs
   - Platform releases full event value to vendor (no fees deducted)
   - Merchant can leave review

### Phase 2: Subscription Management

#### Subscription Tiers

**Merchant Plans:**
- **Free**: 3 events/month, basic dashboard
- **Pro ($19/month)**: Unlimited events, analytics, priority support
- **Enterprise ($49/month)**: Custom integrations, dedicated support

**Vendor Plans:**
- **Free**: 5 requests/month, basic profile
- **Pro ($29/month)**: Unlimited requests, featured placement
- **Premium ($79/month)**: Priority booking, custom branding

### Phase 3: Advanced Features

#### Premium Services
- **Featured Events**: Pay to promote specific events
- **Priority Booking**: Vendors pay for early access to premium events
- **Analytics Dashboard**: Advanced reporting and insights
- **API Access**: For third-party integrations

## Implementation Roadmap

### Month 1-2: Basic Payment Integration
1. Set up Stripe integration
2. Implement basic transaction fees
3. Add payment status tracking
4. Create payment dashboard

### Month 3-4: Subscription System
1. Implement subscription tiers
2. Add usage tracking
3. Create upgrade/downgrade flows
4. Implement billing cycles

### Month 5-6: Advanced Features
1. Premium listings
2. Analytics dashboard
3. API access
4. Advanced reporting

## Technical Implementation

### Stripe Integration
```typescript
// Payment processing - UPDATED FEE STRUCTURE
const createPaymentIntent = async (eventId: string, amount: number) => {
  const platformFee = amount * 0.08 // 8% platform fee (our revenue)
  const processingFee = (amount * 0.029) + 0.30 // Stripe fee (merchant pays)
  const totalAmount = amount + platformFee + processingFee // Total merchant pays
  const vendorPayout = amount // Vendor receives full event value
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100), // Convert to cents
    currency: 'usd',
    metadata: { eventId },
    application_fee_amount: Math.round(platformFee * 100), // Only platform fee
    transfer_data: {
      destination: vendorId,
      amount: Math.round(vendorPayout * 100), // Full event value to vendor
    },
  });
  return paymentIntent;
};

// Subscription management
const createSubscription = async (customerId: string, priceId: string) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  return subscription;
};
```

### Database Functions
```sql
-- Calculate platform fees - UPDATED: Vendor receives full event value
CREATE OR REPLACE FUNCTION calculate_platform_fees(event_value DECIMAL)
RETURNS TABLE(platform_fee DECIMAL, processing_fee DECIMAL, total_fee DECIMAL, vendor_payout DECIMAL)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    event_value * 0.08 as platform_fee,
    (event_value * 0.029) + 0.30 as processing_fee,
    (event_value * 0.109) + 0.30 as total_fee,
    event_value as vendor_payout; -- Vendor receives full event value
END;
$$ LANGUAGE plpgsql;
```

## Typical Event Values & Pricing Guide

### Event Size Categories & Suggested Pricing

#### Micro Events (0-50 people): $100-300
- **Examples**: Small office lunches, intimate gatherings, family events
- **Typical Duration**: 2-4 hours
- **Vendor Requirements**: 1-2 staff members, basic setup

#### Small Events (50-100 people): $200-500
- **Examples**: Office parties, small corporate events, community gatherings
- **Typical Duration**: 3-6 hours
- **Vendor Requirements**: 2-3 staff members, standard setup

#### Medium Events (100-300 people): $500-1,000
- **Examples**: Company picnics, medium corporate events, festivals
- **Typical Duration**: 4-8 hours
- **Vendor Requirements**: 3-5 staff members, expanded setup

#### Large Events (300+ people): $1,000-2,500
- **Examples**: Large corporate events, community festivals, major celebrations
- **Typical Duration**: 6-12 hours
- **Vendor Requirements**: 5+ staff members, full setup with multiple stations

#### Premium Events (corporate, special occasions): $2,500+
- **Examples**: Executive events, luxury corporate functions, high-end private parties
- **Typical Duration**: 4-8 hours
- **Vendor Requirements**: Premium service, custom menus, specialized staff

### Fee Structure Examples

#### Example 1: $500 Event (Medium Event)
- **Event Value**: $500
- **Platform Fee (8%)**: $40 (our revenue)
- **Processing Fee**: $14.80 (Stripe fee)
- **Total Merchant Pays**: $554.80
- **Vendor Receives**: $500 (full amount)

#### Example 2: $1,000 Event (Large Event)
- **Event Value**: $1,000
- **Platform Fee (8%)**: $80 (our revenue)
- **Processing Fee**: $29.30 (Stripe fee)
- **Total Merchant Pays**: $1,109.30
- **Vendor Receives**: $1,000 (full amount)

#### Example 3: $2,500 Event (Premium Event)
- **Event Value**: $2,500
- **Platform Fee (8%)**: $200 (our revenue)
- **Processing Fee**: $72.80 (Stripe fee)
- **Total Merchant Pays**: $2,772.80
- **Vendor Receives**: $2,500 (full amount)

#### Example 4: $200 Event (Small Event)
- **Event Value**: $200
- **Platform Fee (8%)**: $16 (our revenue)
- **Processing Fee**: $6.10 (Stripe fee)
- **Total Merchant Pays**: $222.10
- **Vendor Receives**: $200 (full amount)

## Risk Management

### Payment Protection
- **Escrow System**: Hold payments until event completion
- **Dispute Resolution**: Clear process for payment disputes
- **Refund Policy**: Standardized refund procedures

### Fraud Prevention
- **Identity Verification**: KYC for high-value transactions
- **Transaction Monitoring**: Flag suspicious activity
- **Rate Limiting**: Prevent abuse of free tiers

## Success Metrics

### Key Performance Indicators
- **Monthly Recurring Revenue (MRR)**
- **Average Revenue Per User (ARPU)**
- **Customer Lifetime Value (CLV)**
- **Churn Rate**
- **Conversion Rate** (Free to Paid)

### Revenue Targets
- **Year 1**: $75K - $150K ARR (adjusted for new pricing strategy)
- **Year 2**: $300K - $750K ARR (increased merchant adoption)
- **Year 3**: $1.5M+ ARR (market expansion)

## Competitive Analysis

### Market Positioning
- **Lower fees** than traditional event booking platforms (15-20%)
- **Simplified pricing** compared to complex enterprise solutions
- **Focus on food truck niche** vs. general event platforms
- **Vendor-friendly** - vendors receive full event value

### Pricing Strategy
- **Freemium model** to drive adoption
- **Value-based pricing** for premium features
- **Volume discounts** for enterprise customers
- **Transparent fee structure** - no hidden costs

## Benefits of Updated Fee Structure

### For Merchants:
- **Transparency**: Know exactly what they're paying upfront
- **Control**: Set event values based on their budget
- **Quality**: Higher values attract better vendors
- **Fairness**: Pay for the service they receive
- **Lower Barrier**: Reduced subscription costs encourage adoption

### For Vendors:
- **Full Payment**: Receive 100% of the event value they agreed to
- **No Hidden Fees**: No surprise deductions from their earnings
- **Predictable Income**: Know exactly what they'll earn
- **Motivation**: Incentivized to provide excellent service
- **Higher Value**: Premium subscription reflects lead generation value

### For the Platform:
- **Sustainable Revenue**: Clear 8% platform fee
- **Competitive Advantage**: Vendor-friendly compared to competitors
- **Market Efficiency**: Helps establish fair market rates
- **Quality Control**: Higher values correlate with better service
- **Volume Growth**: Lower merchant fees drive more events and transaction revenue

## Pricing Strategy Rationale

### Merchant Pricing Reduction ($29→$19, $99→$49)
**Why Lower Merchant Fees:**
- **Adoption Driver**: Lower barrier to entry increases merchant signups
- **Volume Strategy**: More merchants = more events = more transaction fees
- **Competitive Positioning**: More attractive than hiring event coordinators
- **Revenue Model**: Primary revenue from transaction fees, not subscriptions

### Vendor Pricing Increase ($19→$29, $49→$79)
**Why Higher Vendor Fees:**
- **Value Proposition**: Vendors get guaranteed, qualified leads
- **Revenue Potential**: Vendors can earn $200-2,500+ per event
- **Quality Filter**: Higher prices attract serious, professional vendors
- **Market Position**: Vendors willing to pay more for reliable business

### Revenue Model Impact
- **Transaction Fees**: Primary revenue stream (8% + processing)
- **Merchant Subscriptions**: Lower pricing drives adoption
- **Vendor Subscriptions**: Higher pricing reflects value received
- **Overall Strategy**: Volume-based revenue through transaction fees

## Conclusion

This updated payment strategy provides a fair and transparent fee structure where:
- **Merchants** pay all fees and get quality vendors
- **Vendors** receive their full agreed-upon payment
- **Platform** generates sustainable revenue through clear 8% fees

The structure is designed to be competitive, transparent, and beneficial for all parties involved in the marketplace. 