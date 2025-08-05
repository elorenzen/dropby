<template>
    <div class="page-content">
        <!-- Hero Section -->
        <div class="section hero-section" style="text-align: center;">
            <div class="hero-content">
                <div class="font-bold hero-title">Event Scheduling Made Easy!</div>
                <div class="hero-description">
                  Good drinks belong with good eats,
                  and every food truck should have a spot to serve a hungry crowd.
                  With <span class="font-bold brand-highlight">DropBy</span>, businesses can find each other and book events,
                  increasing sales for both, and improving the overall experience for a shared customer base.
                </div>
                
                <!-- Call to Action Buttons -->
                <div class="hero-actions">
                    <NuxtLink to="/viewer/events">
                        <Button 
                            label="Browse Events" 
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
                                <BaseIcon name="rocket" color="#FF8906" size="20" />
                            </template>
                        </Button>
                    </NuxtLink>
                </div>
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
                        <BaseIcon name="search" color="#FF8906" size="48" />
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
                                    <BaseIcon name="map-marker" color="#FF8906" size="18" />
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
                                    <BaseIcon name="truck" color="#FF8906" size="18" />
                                </template>
                            </Button>
                        </NuxtLink>
                    </div>
                </div>
                
                <div class="user-type-card business-card">
                    <div class="user-type-icon">
                        <BaseIcon name="building" color="#FF8906" size="48" />
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
                        <Button 
                            label="Learn More" 
                            outlined
                            class="secondary-cta"
                            @click="scrollToFeatures"
                        >
                            <template #icon>
                                <BaseIcon name="info-circle" color="#FF8906" size="18" />
                            </template>
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="section features-section" id="features">
            <div class="section-header">
                <h2 class="section-title">Why Choose DropBy?</h2>
                <p class="section-subtitle">Connect, collaborate, and grow your business together</p>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <BaseIcon name="calendar" color="#FF8906" size="32" />
                    </div>
                    <h3>Smart Scheduling</h3>
                    <p>Intelligent event scheduling that works around your business hours and availability</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <BaseIcon name="map-marker" color="#FF8906" size="32" />
                    </div>
                    <h3>Location-Based Matching</h3>
                    <p>Find the perfect partners near you with our advanced location matching system</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <BaseIcon name="chart-line" color="#FF8906" size="32" />
                    </div>
                    <h3>Boost Your Revenue</h3>
                    <p>Increase foot traffic and sales through strategic partnerships and events</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">
                        <BaseIcon name="users" color="#FF8906" size="32" />
                    </div>
                    <h3>Community Building</h3>
                    <p>Build lasting relationships with other local businesses in your community</p>
                </div>
            </div>
        </div>

        <!-- Statistics Section -->
        <div class="section stats-section">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">500+</div>
                    <div class="stat-label">Active Businesses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">1,200+</div>
                    <div class="stat-label">Events Created</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$2.5M+</div>
                    <div class="stat-label">Revenue Generated</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">4.8★</div>
                    <div class="stat-label">Average Rating</div>
                </div>
            </div>
        </div>

        <!-- Galleries Section -->
        <div class="section">
            <HomeGalleries />
        </div>

        <!-- Testimonials Section -->
        <div class="section testimonials-section">
            <div class="section-header">
                <h2 class="section-title">What Our Partners Say</h2>
                <p class="section-subtitle">Real stories from real businesses</p>
            </div>
            
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <div class="testimonial-content">
                        <p>"DropBy helped us increase our weekend sales by 40% through strategic food truck partnerships. The platform is incredibly easy to use!"</p>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <strong>Sarah Chen</strong>
                            <span>Owner, Craft Brew Co.</span>
                        </div>
                    </div>
                </div>
                
                <div class="testimonial-card">
                    <div class="testimonial-content">
                        <p>"Finding consistent locations for our food truck was always a challenge. DropBy solved that problem and connected us with amazing venues."</p>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <strong>Mike Rodriguez</strong>
                            <span>Chef, Taco Truck Deluxe</span>
                        </div>
                    </div>
                </div>
                
                <div class="testimonial-card">
                    <div class="testimonial-content">
                        <p>"The analytics and insights from DropBy have been invaluable for understanding our customer patterns and optimizing our events."</p>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <strong>Emily Watson</strong>
                            <span>Manager, Downtown Taproom</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="section cta-section">
            <div class="cta-content">
                <h2>Ready to Grow Your Business?</h2>
                <p>Join hundreds of businesses already using DropBy to create amazing events and boost their revenue.</p>
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
                    <NuxtLink to="/viewer/events">
                        <Button 
                            label="Explore Events" 
                            outlined
                            class="secondary-cta"
                        >
                            <template #icon>
                                <BaseIcon name="search" color="#FF8906" size="20" />
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

const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
    padding: 4rem 0;
    background: linear-gradient(135deg, rgba(255,137,6,0.1) 0%, rgba(255,137,6,0.05) 100%);
    border-radius: 2rem;
    margin-bottom: 4rem;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #FF8906 0%, #FF6B35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-description {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
}

.brand-highlight {
    color: #FF8906;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.primary-cta {
    background: linear-gradient(135deg, #FF8906 0%, #FF6B35 100%) !important;
    border: none !important;
    padding: 1rem 2rem !important;
    font-weight: 600 !important;
}

.secondary-cta {
    border-color: #FF8906 !important;
    color: #FF8906 !important;
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
    background: linear-gradient(135deg, #FF8906 0%, #FF6B35 100%);
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

/* Features Section */
.features-section {
    margin-bottom: 4rem;
}

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

.features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-top: 3rem;
}

.feature-card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 1.25rem;
    text-align: center;
    border: 1px solid var(--surface-border);
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 40px 0 rgba(0,0,0,0.55);
    border-color: var(--primary-color);
}

.feature-icon {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
}

.feature-card h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--heading-color);
}

.feature-card p {
    color: var(--text-color-secondary);
    line-height: 1.6;
}

/* Statistics Section */
.stats-section {
    margin-bottom: 4rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
}

.stat-card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 1.25rem;
    text-align: center;
    border: 1px solid var(--surface-border);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 32px 0 rgba(0,0,0,0.45);
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.stat-label {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Testimonials Section */
.testimonials-section {
    margin-bottom: 4rem;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 3rem;
}

.testimonial-card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 1.25rem;
    border: 1px solid var(--surface-border);
    transition: all 0.3s ease;
}

.testimonial-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 32px 0 rgba(0,0,0,0.45);
}

.testimonial-content {
    margin-bottom: 1.5rem;
}

.testimonial-content p {
    color: var(--text-color-secondary);
    line-height: 1.6;
    font-style: italic;
    font-size: 1rem;
}

.testimonial-author {
    border-top: 1px solid var(--surface-border);
    padding-top: 1rem;
}

.author-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.author-info strong {
    color: var(--heading-color);
    font-size: 0.875rem;
}

.author-info span {
    color: var(--text-color-secondary);
    font-size: 0.75rem;
}

/* CTA Section */
.cta-section {
    background: linear-gradient(135deg, rgba(255,137,6,0.1) 0%, rgba(255,137,6,0.05) 100%);
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
    .user-type-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
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
    
    .stats-grid {
        grid-template-columns: 1fr;
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
}
</style>