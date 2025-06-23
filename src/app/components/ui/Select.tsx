"use client";

import * as React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'auth' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    variant = 'default', 
    size = 'md',
    className = '',
    id,
    children,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = "block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors appearance-none";
    
    const variantClasses = {
      default: "bg-white dark:bg-black border-gray-300 dark:border-neutral-700 focus:ring-brand-start focus:border-brand-start",
      auth: "bg-white dark:bg-black border-gray-300 dark:border-neutral-700 focus:ring-brand-start focus:border-brand-start focus:z-10",
      disabled: "bg-gray-50 dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base"
    };

    const selectClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      error && "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500",
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 