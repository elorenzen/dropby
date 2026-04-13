<template>
  <div class="how-it-works-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">How It Works</h1>
        <p class="hero-description">
          DropBy connects drinking establishments with food trucks to create amazing events.
          Learn how our platform helps businesses collaborate and grow together.
        </p>
      </div>
    </div>

    <!-- How It Works for Merchants -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">For Merchants (Breweries, Wine Bars & Establishments)</h2>
        <p class="section-subtitle">Find food trucks and create events that drive traffic</p>
      </div>

      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Create Your Profile</h3>
            <p>Sign up as a merchant and set up your business profile with location, hours, and amenities</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Post Events</h3>
            <p>Create events when you want food trucks. Set your date, event value, and special requirements</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Receive Requests</h3>
            <p>Food trucks will request to book your event. Choose the best fit for your venue and needs</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Host & Grow</h3>
            <p>Host your event and enjoy increased foot traffic. Leave reviews to help build the community</p>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works for Vendors -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">For Vendors (Food Trucks)</h2>
        <p class="section-subtitle">Discover events and grow your business</p>
      </div>

      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Create Your Profile</h3>
            <p>Sign up as a vendor and showcase your food truck with photos, menu, and location</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Browse Events</h3>
            <p>Search for available events near you. Filter by location, date, and event value</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Request to Book</h3>
            <p>Submit a booking request to merchants. Get notified when approved or declined</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Serve & Earn</h3>
            <p>Show up to your events, serve great food, and get paid directly through the platform</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing teaser -->
    <div class="section pricing-teaser">
      <div class="section-header">
        <h2 class="section-title">Pricing</h2>
        <p class="section-subtitle">Simple monthly plans for merchants and food trucks. Compare tiers and start in minutes.</p>
        <NuxtLink to="/pricing" class="pricing-teaser-link">
          <Button label="View pricing" icon="pi pi-arrow-right" iconPos="right" outlined class="pricing-teaser-button" />
        </NuxtLink>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-container">
        <div class="features-header">
          <div class="features-title">
            <span>Key </span>
            <span class="text-primary">Features</span>
          </div>
          <div class="features-subtitle">Everything you need to succeed</div>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon-container">
              <i class="pi pi-map-marker feature-icon" />
            </span>
            <div class="feature-content">
              <div class="feature-title">Location-Based Matching</div>
              <p>Find partners near you with our intelligent location matching system</p>
            </div>
          </div>
          <div class="feature-card">
            <span class="feature-icon-container">
              <i class="pi pi-calendar feature-icon" />
            </span>
            <div class="feature-content">
              <div class="feature-title">Smart Event Scheduling</div>
              <p>Create events, set recurring schedules, and manage your calendar with ease</p>
            </div>
          </div>
          <div class="feature-card">
            <span class="feature-icon-container">
              <i class="pi pi-dollar feature-icon" />
            </span>
            <div class="feature-content">
              <div class="feature-title">Direct Payment Processing</div>
              <p>Get paid directly through the platform with secure Stripe integration</p>
            </div>
          </div>
          <div class="feature-card">
            <span class="feature-icon-container">
              <i class="pi pi-star feature-icon" />
            </span>
            <div class="feature-content">
              <div class="feature-title">Rating System</div>
              <p>Build trust with our two-way rating system for both merchants and vendors</p>
            </div>
          </div>
          <div class="feature-card">
            <span class="feature-icon-container">
              <i class="pi pi-chart-line feature-icon" />
            </span>
            <div class="feature-content">
              <div class="feature-title">Analytics & Insights</div>
              <p>Track your events, bookings, and revenue with detailed analytics</p>
            </div>
          </div>
          <div class="feature-card">
            <span class="feature-icon-container">
              <i class="pi pi-bell feature-icon" />
            </span>
            <div class="feature-content">
              <div class="feature-title">Smart Notifications</div>
              <p>Get notified about new events, booking requests, and important updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="cta-content">
        <h2>Ready to Get Started?</h2>
        <p>Join the many businesses already using DropBy to create amazing events</p>
        <div class="cta-buttons">
          <NuxtLink to="/get-started">
            <Button label="Get Started" class="primary-cta">
              <template #icon>
                <BaseIcon name="plus" color="#fff" size="20" />
              </template>
            </Button>
          </NuxtLink>
          <NuxtLink to="/events">
            <Button label="Browse Events" outlined class="secondary-cta">
              <template #icon>
                <BaseIcon name="calendar" color="var(--primary-color)" size="20" />
              </template>
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ['/how-it-works'],
})
useSeoMeta({
  title: 'How It Works - DropBy',
  description:
    'Learn how DropBy connects drinking establishments with food trucks to create amazing events and grow your business together.',
})
</script>

<style scoped>
.how-it-works-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 4rem;
  background: linear-gradient(
    135deg,
    rgba(from var(--primary-color) r g b / 0.1) 0%,
    rgba(from var(--success-color) r g b / 0.05) 100%
  );
  border-radius: 2rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.section {
  margin-bottom: 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--heading-color);
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.pricing-teaser .section-header {
  margin-bottom: 0;
}

.pricing-teaser-link {
  display: inline-flex;
  margin-top: 1.5rem;
}

.pricing-teaser-button {
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
  font-weight: 600 !important;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.step-card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 1.25rem;
  border: 1px solid var(--surface-border);
  transition: all 0.3s ease;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 40px 0 rgba(0, 0, 0, 0.55);
  border-color: var(--primary-color);
}

.step-number {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--heading-color);
}

.step-content p {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.features-section {
  background: var(--surface-ground);
  padding: 5rem 1.5rem;
  text-align: center;
  margin: 0 -2rem;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-header {
  margin-bottom: 3rem;
}

.features-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--heading-color);
}

.features-title .text-primary {
  color: var(--primary-color) !important;
}

.features-subtitle {
  font-size: 1rem;
  color: var(--text-color-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  padding: 1.5rem;
}

.feature-icon-container {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-card);
  border-radius: 0.75rem;
  margin: 0 auto 1.5rem;
  box-shadow: var(--card-shadow);
}

.feature-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--heading-color);
}

.feature-card p {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.cta-section {
  background: linear-gradient(
    135deg,
    rgba(from var(--primary-color) r g b / 0.1) 0%,
    rgba(from var(--success-color) r g b / 0.05) 100%
  );
  border-radius: 2rem;
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--heading-color);
}

.cta-content p {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-cta {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%) !important;
  border: none !important;
  padding: 1rem 2rem !important;
  font-weight: 600 !important;
}

.secondary-cta {
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
  padding: 1rem 2rem !important;
  font-weight: 600 !important;
}

@media (max-width: 768px) {
  .how-it-works-page {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .steps-container {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-content h2 {
    font-size: 1.75rem;
  }

  .cta-section {
    padding: 2rem 1.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .features-section {
    margin: 0 -1rem;
    padding: 3rem 1rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 0;
  }

  .step-card {
    flex-direction: column;
    text-align: center;
  }

  .step-number {
    margin: 0 auto;
  }
}
</style>
