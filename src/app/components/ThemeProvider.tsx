"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Predefined color themes (matching the ones in company-branding page)
const colorThemes = {
  'professional-blue': {
    primary: '#2563eb',
    secondary: '#1e40af',
    start: '#2563eb',
    end: '#1e40af'
  },
  'modern-orange': {
    primary: '#f97316',
    secondary: '#ea580c',
    start: '#f97316',
    end: '#ea580c'
  },
  'elegant-purple': {
    primary: '#7c3aed',
    secondary: '#6d28d9',
    start: '#7c3aed',
    end: '#6d28d9'
  },
  'nature-green': {
    primary: '#16a34a',
    secondary: '#15803d',
    start: '#16a34a',
    end: '#15803d'
  },
  'bold-red': {
    primary: '#dc2626',
    secondary: '#b91c1c',
    start: '#dc2626',
    end: '#b91c1c'
  },
  'minimal-gray': {
    primary: '#6b7280',
    secondary: '#4b5563',
    start: '#6b7280',
    end: '#4b5563'
  }
};

type ThemeContextType = {
  currentTheme: string;
  themeColors: typeof colorThemes['modern-orange'];
  isLoading: boolean;
  refreshTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'modern-orange',
  themeColors: colorThemes['modern-orange'],
  isLoading: true,
  refreshTheme: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Function to generate CSS for brand colors
const generateBrandCSS = (themeColors: typeof colorThemes['modern-orange']) => {
  return `
    .bg-brand-start { background-color: ${themeColors.start} !important; }
    .bg-brand-end { background-color: ${themeColors.end} !important; }
    .text-brand-start { color: ${themeColors.start} !important; }
    .text-brand-end { color: ${themeColors.end} !important; }
    .border-brand-start { border-color: ${themeColors.start} !important; }
    .ring-brand-start { --tw-ring-color: ${themeColors.start} !important; }
    
    .bg-gradient-to-r.from-brand-start.to-brand-end {
      background-image: linear-gradient(to right, ${themeColors.start}, ${themeColors.end}) !important;
    }
    
    .hover\\:bg-brand-start\\/90:hover { background-color: ${themeColors.start} !important; }
    .hover\\:text-brand-start\\/90:hover { color: ${themeColors.start} !important; }
    
    .focus\\:ring-brand-start:focus { --tw-ring-color: ${themeColors.start} !important; }
    .focus\\:border-brand-start:focus { border-color: ${themeColors.start} !important; }
  `;
};

// Function to inject CSS into the document
const injectCSS = (css: string, id: string) => {
  // Remove existing style tag if it exists
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style tag
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
};

// Function to apply theme to DOM
const applyThemeToDOM = (themeColors: typeof colorThemes['modern-orange']) => {
  const css = generateBrandCSS(themeColors);
  injectCSS(css, 'dynamic-brand-theme');
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [currentTheme, setCurrentTheme] = useState('modern-orange');
  const [isLoading, setIsLoading] = useState(true);

  // Function to load and apply theme from server
  const loadUserTheme = useCallback(async () => {
    if (!session?.user) {
      // Reset to default theme when not authenticated
      setCurrentTheme('modern-orange');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const userData = await res.json();
        const userTheme = userData.brand_theme || 'modern-orange';
        setCurrentTheme(userTheme);
      } else {
        // Fallback to default theme if API fails
        setCurrentTheme('modern-orange');
      }
    } catch {
      // Fallback to default theme if API fails
      setCurrentTheme('modern-orange');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Load user's theme preference when session is available
  useEffect(() => {
    if (status === 'loading') return;
    
    loadUserTheme();
  }, [session, status, loadUserTheme]);

  // Apply theme whenever currentTheme changes
  useEffect(() => {
    const themeColors = colorThemes[currentTheme as keyof typeof colorThemes] || colorThemes['modern-orange'];
    applyThemeToDOM(themeColors);
  }, [currentTheme]);

  // Function to refresh theme (useful for when user changes theme)
  const refreshTheme = () => {
    setIsLoading(true);
    loadUserTheme();
  };

  const themeColors = colorThemes[currentTheme as keyof typeof colorThemes] || colorThemes['modern-orange'];

  return (
    <ThemeContext.Provider value={{ currentTheme, themeColors, isLoading, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 