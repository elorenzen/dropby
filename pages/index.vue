<template>
    <div class="page-content">
        <!-- Hero Section with Image -->
        <div class="hero-container">
            <div class="hero-content-section">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="block">Where great</span>
                        <span class="block">food meets</span>
                        <span class="block">great drinks</span>
                    </h1>
                    <p class="hero-description">
                        Discover the best food trucks at your favorite breweries and bars. 
                        Great food, great drinks, all in one place.
                    </p>
                    <div class="hero-actions">
                        <NuxtLink to="/viewer/events">
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
            <div class="hero-image-section">
                <div class="hero-image-overlay"></div>
                <img
                    src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074&auto=format&fit=crop"
                    alt="Food trucks and events"
                    class="hero-image"
                />
            </div>
        </div>

        <!-- User Type Selection Section -->
        <div class="section user-type-section">
            <div class="section-header">
                <h2 class="section-title">How Can We Help You?</h2>
                <p class="section-subtitle">Choose your path to discover amazing food and events</p>
            </div>
            
            <div class="user-type-grid">
                <div class="user-type-card patron-card">
                    <div class="user-type-icon">
                        <BaseIcon name="search" color="var(--primary-color)" size="48" />
                    </div>
                    <h3>I'm Looking for Food & Events</h3>
                    <p>Discover local food trucks, bars, and exciting events near you</p>
                    <div class="user-type-actions">
                        <NuxtLink to="/viewer/events">
                            <Button 
                                label="Find Events" 
                                class="primary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="calendar" color="#fff" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                        <NuxtLink to="/establishments">
                            <Button 
                                label="Browse Bars" 
                                outlined
                                class="secondary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="map-marker" color="var(--primary-color)" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                        <NuxtLink to="/food-trucks">
                            <Button 
                                label="Find Food Trucks" 
                                outlined
                                class="secondary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="truck" color="var(--primary-color)" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
                
                <div class="user-type-card business-card">
                    <div class="user-type-icon">
                        <BaseIcon name="building" color="var(--primary-color)" size="48" />
                    </div>
                    <h3>I'm a Business Owner</h3>
                    <p>Connect with partners, schedule events, and grow your business</p>
                    <div class="user-type-actions">
                        <NuxtLink to="/get-started">
                            <Button 
                                label="Start Free Trial" 
                                class="primary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="rocket" color="#fff" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                        <NuxtLink to="/viewer/about">
                            <Button 
                                label="Learn More" 
                                outlined
                                class="secondary-cta"
                            >
                                <template #icon>
                                    <BaseIcon name="info-circle" color="var(--primary-color)" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>

        <!-- Galleries Section -->
        <div class="section">
            <HomeGalleries />
        </div>

        <!-- CTA Section -->
        <div class="section cta-section">
            <div class="cta-content">
                <h2>Ready to Get Started?</h2>
                <p>Join DropBy today and start creating unforgettable events that bring communities together.</p>
                <div class="cta-buttons">
                    <NuxtLink to="/get-started">
                        <Button 
                            label="Start Free Trial" 
                            class="primary-cta"
                        >
                            <template #icon>
                                <BaseIcon name="rocket" color="#fff" size="20" />
                            </template>
                        </Button>
                    </NuxtLink>
                    <NuxtLink to="/viewer/about">
                        <Button 
                            label="Learn More" 
                            outlined
                            class="secondary-cta"
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
/* Hero Section with Image */
.hero-container {
    display: flex;
    min-height: 70vh;
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    margin-bottom: 4rem;
    background: var(--surface-ground);
}

.hero-content-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    position: relative;
    z-index: 2;
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

.hero-image-section {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.hero-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--surface-ground) 0%, transparent 100%);
    z-index: 1;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    grid-template-columns: 1fr 1fr;
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

.user-type-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
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
        flex-direction: column;
        min-height: auto;
    }
    
    .hero-content-section {
        order: 2;
        padding: 2rem;
    }
    
    .hero-image-section {
        order: 1;
        height: 50vh;
        min-height: 300px;
    }
    
    .hero-image-overlay {
        background: linear-gradient(0deg, var(--surface-ground) 0%, transparent 100%);
    }
    
    .user-type-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
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
    
    .hero-image-section {
        height: 40vh;
        min-height: 250px;
    }
}
</style>