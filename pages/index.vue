<template>
    <div class="page-content">
        <div class="section" style="text-align: center;">
            <div>
                <div class="font-bold" style="font-size: 2rem; margin-bottom: 1rem;">Event Scheduling Made Easy!</div>
                <div style="font-size: 1.2rem; margin-bottom: 2rem; max-width: 800px; margin-left: auto; margin-right: auto;">
                  Good drinks belong with good eats,
                  and every food truck should have a spot to serve a hungry crowd.
                  With <span class="font-bold" style="color: #FF8906;">DropBy</span>, businesses can find each other and book events,
                  increasing sales for both, and improving the overall experience for a shared customer base.
                </div>
            </div>

            <!-- Call to Action Buttons -->
            <div style="margin-bottom: 2rem;">
                <NuxtLink to="/viewer/events">
                    <Button 
                        label="Browse Events" 
                        style="margin-right: 1rem;"
                    >
                        <template #icon>
                            <BaseIcon name="calendar" color="#fff" size="20" />
                        </template>
                    </Button>
                </NuxtLink>
                <NuxtLink to="/viewer/search">
                    <Button 
                        label="Search Food Trucks" 
                        outlined
                    >
                        <template #icon>
                            <BaseIcon name="search" color="#ff9800" size="20" />
                        </template>
                    </Button>
                </NuxtLink>
            </div>
        </div>
        <div class="section">
            <HomeGalleries />
        </div>
    </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Home' })
</script>