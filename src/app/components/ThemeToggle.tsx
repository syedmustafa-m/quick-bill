"use client";

import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { currentTheme, refreshTheme, isLoading } = useTheme();

  // Don't render until theme is loaded to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="rounded-lg p-2 text-gray-500">
        <div className="h-5 w-5" />
      </div>
    );
  }

  // Placeholder: refreshTheme just reloads the current theme from server
  // For a real toggle, you would implement a toggleTheme in ThemeProvider
  return (
    <button
      onClick={refreshTheme}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
      aria-label="Refresh theme"
    >
      {currentTheme === "light" ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
} 