<template>
  <div class="plans-section">
    <div class="plans-header">
      <h2 class="plans-title">Pricing Plans for Merchants</h2>
      <p class="plans-subtitle">Choose the perfect plan to grow your business</p>
    </div>

    <div class="plans-grid">
      <div
        v-for="plan in merchantPlans"
        :key="plan.id"
        class="plan-card"
        :class="{ featured: plan.featured }"
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

        <NuxtLink :to="`/get-started?businessType=merchant&plan=${plan.id}`">
          <Button :label="plan.buttonText" rounded class="plan-button" />
        </NuxtLink>
      </div>
    </div>

    <div class="plans-header">
      <h2 class="plans-title">Pricing Plans for Vendors</h2>
      <p class="plans-subtitle">Choose the perfect plan to grow your food truck business</p>
    </div>

    <div class="plans-grid">
      <div
        v-for="plan in vendorPlans"
        :key="plan.id"
        class="plan-card"
        :class="{ featured: plan.featured }"
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

        <NuxtLink :to="`/get-started?businessType=vendor&plan=${plan.id}`">
          <Button :label="plan.buttonText" rounded class="plan-button" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { merchantPlans, vendorPlans } from '~/constants/subscriptionPlans'
</script>

<style scoped>
.plans-section {
  background: var(--surface-ground);
  padding: 5rem 1.5rem;
  margin: 0 -2rem;
}

.plans-header {
  text-align: center;
  margin-bottom: 3rem;
}

.plans-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--heading-color);
}

.plans-subtitle {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.plans-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 80rem;
  margin: 0 auto;
  margin-bottom: 5rem;
}

.plans-grid .plan-card {
  flex: 1;
  min-width: 280px;
}

.plan-card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid var(--surface-border);
  transition: all 0.3s ease;
}

.plan-card.featured {
  border: 2px solid var(--primary-color);
  box-shadow: 0 8px 40px 0 rgba(0, 0, 0, 0.55);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 40px 0 rgba(0, 0, 0, 0.55);
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
  background: var(--surface-border);
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
  color: var(--text-color-secondary);
}

.plan-features .icon-success {
  color: var(--success-color);
  font-size: 1.125rem;
}

.plan-features span {
  color: var(--p-text-color);
  line-height: 1.6;
}

.plan-button {
  width: 100%;
}

@media (max-width: 768px) {
  .plans-title {
    font-size: 2rem;
  }

  .plans-grid {
    gap: 1rem;
  }

  .plan-card {
    padding: 1.5rem;
  }

  .plan-price .price {
    font-size: 2rem;
  }
}
</style>
