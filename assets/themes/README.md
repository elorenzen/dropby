# DropBy Theme System

This directory contains the custom PrimeVue theme configuration for DropBy.

## Overview

DropBy uses PrimeVue v4's theming system with a custom preset based on Aura. The theme supports easy light/dark mode switching and uses a custom color palette.

## Files

- `dropby-theme.ts` - Main theme configuration file (TypeScript)
- `assets/styles/base.css` - App-specific CSS and utility classes

- **`dropby-theme.ts`** (TypeScript): PrimeVue theme configuration
  - Defines color palettes, semantic tokens, and theme options
  - PrimeVue uses this to generate CSS variables and component styles
  - Single source of truth for all color values

- **`base.css`** (CSS): App-specific styles
  - Custom utility classes (`.text-primary`, `.bg-success`, etc.)
  - Layout styles, spacing, and component overrides
  - References PrimeVue's generated CSS variables (no color duplication)

The theme file generates CSS variables (e.g., `--p-primary-color`) that `base.css` references, ensuring colors are never duplicated and always come from the theme file.

## Color Palette

The theme currently uses **Option 4** (Cyan/Red-Brown/Gold):

- **Primary**: `#0891B2` (Cyan) - Fresh, modern, efficient scheduling
- **Secondary**: `#7C2D12` (Red-Brown) - Grounded, reliable, food-focused  
- **Accent**: `#CA8A04` (Gold) - Success, premium, celebration
- **Success**: `#10B981` (Emerald) - Growth, success
- **Warning**: `#F97316` (Orange) - Energy, enthusiasm
- **Error**: `#EF4444` (Red) - Errors, alerts

### Available Palette Options

Four color palette options are available (defined in `dropby-theme.ts`):

**Option 1: Purple/Red/Amber**
- Primary: `#7C3AED` (Purple) - Creativity, luxury, memorable experiences
- Secondary: `#DC2626` (Red) - Urgency, action, excitement
- Accent: `#F59E0B` (Amber) - Celebration, warmth, success

**Option 2: Sky Blue/Emerald/Orange**
- Primary: `#0EA5E9` (Sky Blue) - Innovation, clarity, digital connection
- Secondary: `#10B981` (Emerald) - Growth, success, positive results
- Accent: `#F97316` (Orange) - Energy, enthusiasm, action

**Option 3: Navy Blue/Emerald/Amber**
- Primary: `#1E40AF` (Navy Blue) - Professionalism, reliability, premium service
- Secondary: `#059669` (Emerald) - Success, growth, positive partnerships
- Accent: `#D97706` (Amber) - Premium, celebration, memorable events

**Option 4: CURRENT - Cyan/Red-Brown/Gold**
- Primary: `#0891B2` (Cyan) - Fresh, modern, efficient scheduling
- Secondary: `#7C2D12` (Red-Brown) - Grounded, reliable, food-focused
- Accent: `#CA8A04` (Gold) - Success, premium, celebration

To switch palettes, edit the `dropbyColors` object in `dropby-theme.ts`.

## Light/Dark Mode

The theme supports easy switching between light and dark modes with **separate color palettes** for each mode.

### How Color Palettes Work

PrimeVue uses the `colorScheme` token group to define different values for light and dark modes:

1. **Primitive Tokens** (Color Palettes): Defined once - these are the base color scales (primary.50 through primary.950)
2. **Semantic Tokens with colorScheme**: Override which primitive tokens are used based on the active theme

**Light Mode:**
- Uses darker shades (500-700) for better contrast on light backgrounds
- Primary: `{primary.500}` = `#0891B2` (base cyan)
- Success: `{success.500}` = `#10B981` (base emerald)
- Surfaces: Light grays and whites

**Dark Mode:**
- Uses lighter shades (300-400) for better contrast on dark backgrounds  
- Primary: `{primary.400}` = `#26c6da` (lighter cyan)
- Success: `{success.400}` = `#34d399` (lighter emerald)
- Surfaces: Dark grays (`#232428` for cards, `#18191b` for background)

### Usage

```vue
<script setup>
const { isDark, toggleTheme, setTheme } = useTheme()
</script>

<template>
  <Button @click="toggleTheme">
    {{ isDark ? 'Light Mode' : 'Dark Mode' }}
  </Button>
  
  <!-- Or set explicitly -->
  <Button @click="setTheme('dark')">Dark</Button>
  <Button @click="setTheme('light')">Light</Button>
</template>
```

### How It Works

- The theme uses class-based dark mode (`.p-dark` class on `<html>`)
- When `.p-dark` is present, PrimeVue automatically uses the `dark` values from `colorScheme`
- When `.p-dark` is absent, PrimeVue uses the `light` values
- User preference is stored in `localStorage` as `dropby-theme`
- If no preference is stored, it respects system preference
- The theme automatically updates when system preference changes (if no manual preference is set)

## Customization

To change colors, edit `dropby-theme.ts`:

1. Update the `dropbyColors` object with your new colors
2. Update the color palette definitions in the `semantic` section
3. PrimeVue will automatically generate light/dark variants

## Theme Structure

The theme extends Aura preset and customizes:

- **Semantic Colors**: Primary, success, warning, error color palettes
- **Surface Colors**: Background and surface colors for light/dark modes
- **Options**: Dark mode selector, CSS layer settings, etc.

## References

- [PrimeVue Theming Documentation](https://primevue.org/theming/styled/)
- [PrimeVue Nuxt Module](https://primevue.org/nuxt/)

