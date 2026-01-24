<template>
    <div>
        <!-- Hero Section with Full-Width Image and Overlaid Text -->
        <div class="hero-container">
            <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074&auto=format&fit=crop"
                alt="Food trucks and events"
                class="hero-image"
            />
            <div class="hero-gradient-overlay"></div>
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="block font-bold text-primary">DropBy,</span>
                        <span class="block">where great</span>
                        <span class="block">food meets</span>
                        <span class="block">great drinks</span>
                    </h1>
                    <p class="hero-description">
                        <span class="block">
                            Pull up to your local spots, breweries and lots. 
                        </span>
                        <span class="block">
                            Great food, great drinks, all in one place.
                        </span>
                    </p>
                    <div class="hero-actions">
                        <NuxtLink to="/events">
                            <Button 
                                label="Find Events" 
                                class="primary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="calendar" color="#fff" size="20" />
                                </template>
                            </Button>
                        </NuxtLink>
                        <NuxtLink to="/get-started">
                            <Button 
                                label="Get Started" 
                                outlined
                                class="secondary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="rocket" color="var(--primary-color)" size="20" />
                                </template>
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>

    <div class="page-content">

        <!-- User Type Selection Section -->
        <div class="section user-type-section">
            <div class="section-header">
                <h2 class="section-title">Ready to get started?</h2>
                <p class="section-subtitle">
                    Join DropBy today and start creating unforgettable events that bring communities together.
                    Choose your path to discover amazing food and events.
                </p>
            </div>
            
            <div class="user-type-grid">
                <div class="user-type-card patron-card">
                    <div class="user-type-icon">
                        <BaseIcon name="search" color="var(--primary-color)" size="48" />
                    </div>
                    <h3>I'm Looking for Food & Events</h3>
                    <p class="mission-statement">
                        Discover amazing food trucks at your favorite breweries, wine bars, and wherever else yo can expect to find food trucks. 
                        Find events near you, explore menus, read reviews, and never miss out on great food experiences. 
                        Perfect for food lovers who want to know where the best food trucks will be.
                    </p>
                    <div class="user-type-actions">
                        <NuxtLink to="/events">
                            <Button 
                                label="Find Events" 
                                class="primary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="calendar" color="#fff" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
                
                <div class="user-type-card merchant-card">
                    <div class="user-type-icon">
                        <i class="pi pi-building" style="font-size: 48px; color: var(--primary-color);"></i>
                    </div>
                    <h3>I'm a Merchant</h3>
                    <p class="mission-statement">
                        For breweries, wine bars, and other drinking establishments. Schedule food truck events, 
                        attract more customers, and create memorable experiences. Manage your calendar, connect with 
                        trusted vendors, and grow your business with exciting food events.
                    </p>
                    <div class="user-type-actions">
                        <NuxtLink to="/get-started?businessType=merchant">
                            <Button 
                                label="Merchant Signup" 
                                class="primary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="rocket" color="#fff" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
                
                <div class="user-type-card vendor-card">
                    <div class="user-type-icon">
                        <i class="pi pi-truck" style="font-size: 48px; color: var(--primary-color);"></i>
                    </div>
                    <h3>I'm a Food Truck Vendor</h3>
                    <p class="mission-statement">
                        For food truck owners and operators. Find new locations, book events at great establishments, 
                        expand your reach, and grow your customer base. Browse available events, request bookings, and 
                        build lasting partnerships with merchants.
                    </p>
                    <div class="user-type-actions">
                        <NuxtLink to="/get-started?businessType=vendor">
                            <Button 
                                label="Vendor Signup" 
                                class="primary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="rocket" color="#fff" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
            </div>
            
            <div class="learn-more-section">
                <NuxtLink to="/about">
                    <Button 
                        label="Learn More" 
                        outlined
                        class="learn-more-cta"
                    >
                        <template #icon>
                            <BaseIcon name="info-circle" color="var(--primary-color)" size="20" />
                        </template>
                    </Button>
                </NuxtLink>
            </div>
        </div>
    </div>
    </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'DropBy - Event Scheduling Made Easy' })

</script>

<style scoped>
/* Hero Section with Full-Width Image and Overlaid Text */
.hero-container {
    position: relative;
    width: 100%;
    min-height: 70vh;
    overflow: hidden;
    margin-bottom: 4rem;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    /* Mask image: fade from left (transparent - shows background) to right (opaque - shows image) */
    -webkit-mask-image: -webkit-gradient(linear, left top, right top, 
        from(rgba(0,0,0,0)), to(rgba(0,0,0,1)));
    mask-image: linear-gradient(to right, 
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,0) 25%,
        rgba(0,0,0,0.3) 40%,
        rgba(0,0,0,0.6) 60%,
        rgba(0,0,0,0.9) 80%,
        rgba(0,0,0,1) 100%
    );
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
}

.hero-gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--p-surface-ground, #ffffff);
    z-index: 0;
}

/* Light mode: White background */
:root:not(.p-dark) .hero-gradient-overlay {
    background: #ffffff;
}

/* Dark mode: Dark background */
html.p-dark .hero-gradient-overlay {
    background: var(--p-surface-ground);
}

.hero-content {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
    min-height: 70vh;
    display: flex;
    align-items: center;
}

.hero-text {
    max-width: 600px;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    color: var(--heading-color);
}

.hero-title .block {
    display: block;
}

.hero-title .text-primary {
    color: var(--primary-color);
}

.hero-description {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    color: var(--text-color-secondary);
    line-height: 1.6;
}


.hero-actions {
    display: flex;
    gap: 1rem;
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

/* User Type Section */
.user-type-section {
    margin-bottom: 4rem;
}

.user-type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 3rem;
}

.user-type-card {
    background: var(--surface-card);
    padding: 3rem 2rem;
    border-radius: 1.5rem;
    text-align: center;
    border: 1px solid var(--surface-border);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.user-type-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
}

.user-type-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 40px 0 rgba(0,0,0,0.55);
    border-color: var(--primary-color);
}

.user-type-icon {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
}

.user-type-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--heading-color);
}

.user-type-card p {
    color: var(--text-color-secondary);
    line-height: 1.6;
    margin-bottom: 2rem;
    font-size: 1.125rem;
}

.mission-statement {
    min-height: 120px;
    display: flex;
    align-items: center;
    flex: 1;
}

.user-type-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin-top: auto;
    padding-top: 2rem;
}

.user-type-actions .primary-cta {
    width: 100%;
    max-width: 200px;
}

.user-type-actions .primary-cta {
    width: 100%;
    max-width: 200px;
}

.user-type-actions .secondary-cta {
    width: 100%;
    max-width: 200px;
    margin-top: 0.5rem;
}

.learn-more-section {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
}

.learn-more-cta {
    border-color: var(--primary-color) !important;
    color: var(--primary-color) !important;
    padding: 1rem 2rem !important;
    font-weight: 600 !important;
}

/* Section Styles */
.section-header {
    text-align: center;
    margin-bottom: 3rem;
}

.section-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--heading-color);
}

.section-subtitle {
    font-size: 1.125rem;
    color: var(--text-color-secondary);
    max-width: 600px;
    margin: 0 auto;
}

/* CTA Section */
.cta-section {
    background: linear-gradient(135deg, rgba(from var(--primary-color) r g b / 0.1) 0%, rgba(from var(--success-color) r g b / 0.05) 100%);
    border-radius: 2rem;
    padding: 3rem;
    text-align: center;
}

.cta-content h2 {
    font-size: 2.5rem;
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

/* Responsive Design */
@media (max-width: 1024px) {
    .hero-container {
        min-height: 60vh;
    }
    
    .hero-content {
        padding: 3rem 2rem;
        min-height: 60vh;
    }
    
    .hero-gradient-overlay {
        background: linear-gradient(to bottom, 
            var(--p-surface-ground, #ffffff) 0%, 
            rgba(255, 255, 255, 0.6) 40%,
            rgba(255, 255, 255, 0.2) 60%,
            transparent 100%
        );
    }
    
    .user-type-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .mission-statement {
        min-height: auto;
    }
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-description {
        font-size: 1.125rem;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    .user-type-card {
        padding: 2rem 1.5rem;
    }
    
    .user-type-card h3 {
        font-size: 1.25rem;
    }
    
    .user-type-card p {
        font-size: 1rem;
    }
    
    .hero-actions,
    .cta-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .cta-section {
        padding: 2rem;
    }
    
    .user-type-actions {
        flex-direction: column;
        align-items: center;
    }
}

@media (max-width: 480px) {
    .page-content {
        padding: 1rem;
    }
    
    .user-type-card {
        padding: 1.5rem 1rem;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-container {
        min-height: 50vh;
    }
    
    .hero-content {
        padding: 2rem 1.5rem;
        min-height: 50vh;
    }
}
</style>