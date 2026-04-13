<template>
  <div class="pricing-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Pricing</h1>
        <p class="hero-description">
          Straightforward plans for drinking establishments and food trucks. Choose what fits your business and get started in minutes.
        </p>
      </div>
    </div>

    <PublicPricingPlans />

    <div class="cta-section">
      <div class="cta-content">
        <h2>Questions?</h2>
        <p>See how DropBy works for your team, or browse live events in your area.</p>
        <div class="cta-buttons">
          <NuxtLink to="/how-it-works">
            <Button label="How it works" outlined class="secondary-cta">
              <template #icon>
                <BaseIcon name="info-circle" color="var(--primary-color)" size="20" />
              </template>
            </Button>
          </NuxtLink>
          <NuxtLink to="/get-started">
            <Button label="Get Started" class="primary-cta">
              <template #icon>
                <BaseIcon name="plus" color="#fff" size="20" />
              </template>
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PublicPricingPlans from '~/components/marketing/PublicPricingPlans.vue'
definePageMeta({
  alias: ['/pricing'],
})
useSeoMeta({
  title: 'Pricing - DropBy',
  description:
    'DropBy subscription plans for merchants and food truck vendors. Compare features and start scheduling events.',
})
</script>

<style scoped>
.pricing-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 2rem;
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
  padding: 0 1rem;
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

.cta-section {
  background: linear-gradient(
    135deg,
    rgba(from var(--primary-color) r g b / 0.1) 0%,
    rgba(from var(--success-color) r g b / 0.05) 100%
  );
  border-radius: 2rem;
  padding: 3rem;
  text-align: center;
  margin-top: 2rem;
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
  .pricing-page {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  .cta-content h2 {
    font-size: 1.75rem;
  }

  .cta-section {
    padding: 2rem 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
