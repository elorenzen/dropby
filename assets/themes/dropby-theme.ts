import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

/**
 * DropBy Custom Theme
 * Based on Aura preset with custom color palette
 * Supports easy light/dark mode switching with separate color palettes
 *
 * CURRENT - Food Truck Theme (Warm Orange/Deep Red/Golden Amber)
 *    Primary: #F97316 (Warm Orange) - Appetizing, energetic, food-focused
 *    Secondary: #991B1B (Deep Red/Burgundy) - Wine bars, sophistication, drinking establishments
 *    Accent: #F59E0B (Golden Amber) - Celebration, success, premium experiences
 */

// Color palettes - same base colors, but can be adjusted for light/dark
const dropbyColors = {
  primary: '#F97316',      // Warm Orange - Appetizing, energetic, food-focused
  secondary: '#991B1B',    // Deep Red/Burgundy - Wine bars, sophistication, drinking establishments
  accent: '#F59E0B',       // Golden Amber - Celebration, success, premium experiences
  success: '#10B981',      // Emerald - Growth, success
  warning: '#F59E0B',      // Golden Amber - Warnings, attention (matches accent)
  error: '#DC2626',        // Red - Errors, alerts
}

const DropByPreset = definePreset(Aura, {
  semantic: {
    // Primary color palette - Warm Orange (food-focused)
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: dropbyColors.primary, // #F97316
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407'
    },
    // Secondary color palette - Deep Red/Burgundy (wine bars, drinking establishments)
    secondary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: dropbyColors.secondary, // #991B1B
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    // Success color (Emerald)
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: dropbyColors.success, // #10B981
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    },
    // Warning/Accent color (Golden Amber)
    warn: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: dropbyColors.accent, // #F59E0B
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    // Error color
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: dropbyColors.error, // #EF4444
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    // Color scheme - override semantic tokens for light and dark modes
    // This allows different color values based on the active theme
    colorScheme: {
      light: {
        // Light mode: use darker shades (500-700) for better contrast on light backgrounds
        primary: {
          color: '{primary.500}', // #F97316 - warm orange
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}'
        },
        secondary: {
          color: '{secondary.500}', // #991B1B - deep red/burgundy
          contrastColor: '#ffffff',
          hoverColor: '{secondary.600}',
          activeColor: '{secondary.700}'
        },
        success: {
          color: '{success.500}', // #10B981 - emerald
          contrastColor: '#ffffff',
          hoverColor: '{success.600}',
          activeColor: '{success.700}'
        },
        warn: {
          color: '{warn.500}', // #F59E0B - golden amber
          contrastColor: '#ffffff',
          hoverColor: '{warn.600}',
          activeColor: '{warn.700}'
        },
        danger: {
          color: '{danger.500}', // #DC2626 - red for errors/alerts
          contrastColor: '#ffffff',
          hoverColor: '{danger.600}',
          activeColor: '{danger.700}'
        }
      },
      dark: {
        // Dark mode: use lighter shades (300-400) for better contrast on dark backgrounds
        primary: {
          color: '{primary.400}', // #fb923c - lighter orange for dark mode
          contrastColor: '#ffffff',
          hoverColor: '{primary.300}',
          activeColor: '{primary.500}'
        },
        secondary: {
          color: '{secondary.400}', // #f87171 - lighter red for dark mode
          contrastColor: '#ffffff',
          hoverColor: '{secondary.300}',
          activeColor: '{secondary.500}'
        },
        success: {
          color: '{success.400}', // #34d399 - lighter emerald for dark mode
          contrastColor: '#ffffff',
          hoverColor: '{success.300}',
          activeColor: '{success.500}'
        },
        warn: {
          color: '{warn.400}', // #fbbf24 - lighter amber for dark mode
          contrastColor: '#1f2937',
          hoverColor: '{warn.300}',
          activeColor: '{warn.500}'
        },
        danger: {
          color: '{danger.400}', // #f87171 - lighter red for dark mode
          contrastColor: '#ffffff',
          hoverColor: '{danger.300}',
          activeColor: '{danger.500}'
        }
      }
    }
  },
  // Surface colors - different for light and dark modes
  surface: {
    colorScheme: {
      light: {
        // Light mode surfaces - light grays and whites
        0: '#ffffff',      // Cards, dialogs - white
        50: '#f8f9fa',    // Very light gray
        100: '#f1f3f5',   // Light gray
        200: '#e9ecef',   // Light gray border
        300: '#dee2e6',   // Medium light gray
        400: '#ced4da',   // Medium gray
        500: '#adb5bd',   // Medium gray
        600: '#868e96',   // Dark gray text
        700: '#495057',   // Darker gray text
        800: '#343a40',   // Very dark gray text
        850: '#2d3238',   // Almost black
        900: '#ffffff',   // Ground/background - WHITE for light mode
        950: '#f8f9fa'    // Alternative light background
      },
      dark: {
        // Dark mode surfaces - your custom dark palette
        0: '#232428',      // Cards, dialogs
        50: '#2d3238',
        100: '#343a40',
        200: '#3d4248',
        300: '#495057',
        400: '#5a6068',
        500: '#6b7280',
        600: '#868e96',
        700: '#9ca3af',
        800: '#b0b3b8',
        850: '#232428',    // Your custom dark surface
        900: '#18191b',    // Your custom dark ground (background)
        950: '#0d0e0f'
      }
    }
  }
})

export default {
  preset: DropByPreset,
  options: {
    darkModeSelector: '.p-dark', // Class-based dark mode
    cssLayer: false, // Set to true if you want CSS layers
    prefix: 'p',
    // You can switch between 'light', 'dark', or 'system'
    // 'system' will respect user's OS preference
    // For manual control, use 'light' or 'dark' and toggle with class
  }
}

