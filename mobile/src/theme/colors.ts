/**
 * Color theme matching the web application
 * Web uses Tailwind CSS, these are the React Native equivalents
 */

export const colors = {
  // Primary gradient colors (purple-pink-red)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea', // Primary purple in gradients
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777', // Primary pink in gradients
    700: '#be185d',
    800: '#9f1239',
    900: '#831843',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // Primary red in gradients
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Emerald accent (used for CTAs, success states)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669', // Primary emerald for buttons
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Orange accent
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic colors
  white: '#ffffff',
  black: '#000000',
  
  background: '#ffffff',
  foreground: '#0f172a',
  
  // Card colors
  card: {
    background: '#ffffff',
    border: '#e5e7eb',
  },
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },
};

// Gradient definitions for common patterns
export const gradients = {
  primary: ['#9333ea', '#db2777', '#dc2626'], // purple-600 -> pink-600 -> red-600
  primaryLight: ['#f3e8ff', '#fce7f3', '#ffedd5'], // purple-100 -> pink-100 -> orange-100
  header: ['#9333ea', '#db2777', '#dc2626'], // Same as primary
  button: ['#9333ea', '#db2777', '#dc2626'], // Same as primary
  accent: ['#f59e0b', '#ef4444'], // orange-500 -> red-500
  footer: ['#1f2937', '#374151', '#1f2937'], // gray-800 -> gray-700 -> gray-800
  emerald: ['#10b981', '#059669'], // emerald-500 -> emerald-600
};

export default colors;
