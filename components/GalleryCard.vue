<template>
  <div class="gallery-card">
    <!-- Card Header with Image -->
    <div class="card-header">
      <div class="image-container">
        <slot name="image" />
        <!-- Overlay gradient for better text readability -->
        <div class="image-overlay"></div>
      </div>
      
      <!-- Business Type Badge -->
      <div class="business-type-badge">
        <slot name="business-type">
          <Badge value="Business" severity="secondary" />
        </slot>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Title and Rating Row -->
      <div class="title-rating-row">
        <h3 class="business-title">
          <slot name="title" />
        </h3>
        <div class="rating-container">
          <slot name="rating" />
        </div>
      </div>

      <!-- Location/Address -->
      <div class="location-info">
        <slot name="misc" />
      </div>

      <!-- Description -->
      <div class="description-container">
        <p class="description-text">
          <slot name="description" />
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <slot name="actions">
          <Button 
            label="View Details" 
            icon="pi pi-external-link"
            outlined
            size="small"
            class="view-button"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for this component
</script>

<style scoped>
.gallery-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1.25rem;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 40px 0 rgba(0,0,0,0.55);
  border-color: var(--primary-color);
}

/* Card Header */
.card-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-container :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-card:hover .image-container :deep(img) {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  pointer-events: none;
}

.business-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

/* Card Content */
.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title-rating-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.business-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.rating-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.location-info {
  margin-bottom: 1rem;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.location-info :deep(p) {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-info :deep(p)::before {
  content: "📍";
  font-size: 0.75rem;
}

.description-container {
  flex: 1;
  margin-bottom: 1.5rem;
}

.description-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-buttons {
  margin-top: auto;
  display: flex;
  gap: 0.75rem;
}

.view-button {
  flex: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-content {
    padding: 1.25rem;
  }
  
  .business-title {
    font-size: 1.125rem;
  }
  
  .description-text {
    -webkit-line-clamp: 2;
  }
}

/* Badge styling */
:deep(.p-badge) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

/* Rating styling */
:deep(.p-rating) {
  font-size: 0.875rem;
}

:deep(.p-rating .p-rating-icon) {
  color: var(--primary-color);
}

:deep(.p-rating .p-rating-icon.p-icon) {
  color: #888;
}

:deep(.p-rating .p-rating-option-active .p-rating-icon.p-icon) {
  color: var(--primary-color);
}

/* Button styling */
:deep(.p-button.p-button-sm) {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
}

:deep(.p-button.p-button-outlined) {
  border-width: 1px;
}
</style>