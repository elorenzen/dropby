<template>
  <div class="about-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">About DropBy</h1>
        <p class="hero-description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <NuxtLink to="/how-it-works" class="hero-link">
          <Button label="How it works" outlined class="secondary-cta">
            <template #icon>
              <BaseIcon name="info-circle" color="var(--primary-color)" size="20" />
            </template>
          </Button>
        </NuxtLink>
      </div>
    </div>

    <section class="content-section">
      <h2 class="section-heading">Our story</h2>
      <p class="prose">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
      <p class="prose">
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.
      </p>
      <p class="prose">
        Aenean lacinia bibendum nulla sed consectetur. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper. Curabitur blandit tempus porttitor.
      </p>
    </section>

    <section class="content-section">
      <h2 class="section-heading">Why we’re building this</h2>
      <p class="prose">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
      </p>
      <p class="prose">
        Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
      </p>
    </section>

    <section class="content-section muted">
      <h2 class="section-heading">What’s next</h2>
      <p class="prose">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. We’re iterating quickly and welcome feedback as we grow the community.
      </p>
      <div class="inline-actions">
        <NuxtLink to="/get-started">
          <Button label="Get started" class="primary-cta">
            <template #icon>
              <BaseIcon name="rocket" color="#fff" size="18" />
            </template>
          </Button>
        </NuxtLink>
        <NuxtLink to="/events">
          <Button label="Browse events" outlined class="secondary-cta">
            <template #icon>
              <BaseIcon name="calendar" color="var(--primary-color)" size="18" />
            </template>
          </Button>
        </NuxtLink>
      </div>
    </section>

    <div class="cta-section">
      <div class="cta-content">
        <h2>Explore DropBy</h2>
        <p>See pricing, learn the product flow, or jump in and create an account.</p>
        <div class="cta-buttons">
          <NuxtLink to="/pricing">
            <Button label="Pricing" outlined class="secondary-cta">
              <template #icon>
                <i class="pi pi-dollar" style="color: var(--primary-color)" />
              </template>
            </Button>
          </NuxtLink>
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
definePageMeta({
  alias: ['/about'],
})

useSeoMeta({
  title: 'About - DropBy',
  description:
    'Learn about DropBy—our story, why we connect food trucks with drinking establishments, and how to get involved.',
})
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 1.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(
    135deg,
    rgba(from var(--primary-color) r g b / 0.1) 0%,
    rgba(from var(--success-color) r g b / 0.05) 100%
  );
  border-radius: 2rem;
}

.hero-content {
  max-width: 640px;
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
  margin-bottom: 1.5rem;
}

.hero-link {
  display: inline-flex;
}

.content-section {
  margin-bottom: 3rem;
}

.content-section.muted {
  padding: 2rem;
  background: var(--surface-ground);
  border-radius: 1.25rem;
  border: 1px solid var(--surface-border);
}

.section-heading {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--heading-color);
}

.prose {
  color: var(--text-color-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: 1.0625rem;
}

.inline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
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
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--heading-color);
}

.cta-content p {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
  max-width: 560px;
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
  .about-page {
    padding: 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  .cta-section {
    padding: 2rem 1.25rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .inline-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
