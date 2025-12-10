import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

/**
 * DropBy Custom Theme
 * Based on Aura preset with custom color palette
 * Supports easy light/dark mode switching with separate color palettes
 */

/*
 * COLOR PALETTE OPTIONS:
 * 
 * 1) Purple/Red/Amber
 *    Primary: #7C3AED (Purple) - Creativity, luxury, memorable experiences
 *    Secondary: #DC2626 (Red) - Urgency, action, excitement
 *    Accent: #F59E0B (Amber) - Celebration, warmth, success
 *
 * 2) Sky Blue/Emerald/Orange
 *    Primary: #0EA5E9 (Sky Blue) - Innovation, clarity, digital connection
 *    Secondary: #10B981 (Emerald) - Growth, success, positive results
 *    Accent: #F97316 (Orange) - Energy, enthusiasm, action
 *
 * 3) Navy Blue/Emerald/Amber
 *    Primary: #1E40AF (Navy Blue) - Professionalism, reliability, premium service
 *    Secondary: #059669 (Emerald) - Success, growth, positive partnerships
 *    Accent: #D97706 (Amber) - Premium, celebration, memorable events
 *
 * 4) CURRENT - Cyan/Red-Brown/Gold
 *    Primary: #0891B2 (Cyan) - Fresh, modern, efficient scheduling
 *    Secondary: #7C2D12 (Red-Brown) - Grounded, reliable, food-focused
 *    Accent: #CA8A04 (Gold) - Success, premium, celebration
 */

// Color palettes - same base colors, but can be adjusted for light/dark
// Currently using Option 4 - Change values below to switch palettes
const dropbyColors = {
  primary: '#0891B2',      // Cyan - Fresh, modern, efficient scheduling (Option 4)
  secondary: '#7C2D12',    // Red-Brown - Grounded, reliable, food-focused (Option 4)
  accent: '#CA8A04',       // Gold - Success, premium, celebration (Option 4)
  success: '#10B981',     // Emerald - Growth, success
  warning: '#F97316',      // Orange - Energy, enthusiasm
  error: '#EF4444',        // Red - Errors, alerts
}

const DropByPreset = definePreset(Aura, {
  semantic: {
    // Primary color palette - shared between light/dark
    primary: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: dropbyColors.primary, // #0891B2
      600: '#0288d1',
      700: '#0277bd',
      800: '#01579b',
      900: '#004d40',
      950: '#001f1f'
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
    // Warning/Accent color (Gold/Amber)
    warn: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: dropbyColors.accent, // #CA8A04
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
          color: '{primary.500}', // #0891B2 - base cyan
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}'
        },
        success: {
          color: '{success.500}', // #10B981 - base emerald
          contrastColor: '#ffffff',
          hoverColor: '{success.600}',
          activeColor: '{success.700}'
        },
        warn: {
          color: '{warn.500}', // #CA8A04 - base gold
          contrastColor: '#ffffff',
          hoverColor: '{warn.600}',
          activeColor: '{warn.700}'
        },
        danger: {
          color: '{danger.500}', // #EF4444 - base red
          contrastColor: '#ffffff',
          hoverColor: '{danger.600}',
          activeColor: '{danger.700}'
        }
      },
      dark: {
        // Dark mode: use lighter shades (300-400) for better contrast on dark backgrounds
        primary: {
          color: '{primary.400}', // #26c6da - lighter cyan for dark mode
          contrastColor: '#ffffff',
          hoverColor: '{primary.300}',
          activeColor: '{primary.500}'
        },
        success: {
          color: '{success.400}', // #34d399 - lighter emerald for dark mode
          contrastColor: '#ffffff',
          hoverColor: '{success.300}',
          activeColor: '{success.500}'
        },
        warn: {
          color: '{warn.400}', // #fbbf24 - lighter gold for dark mode
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

