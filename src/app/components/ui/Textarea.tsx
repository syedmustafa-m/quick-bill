import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    variant = 'default', 
    size = 'md',
    className = '',
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = "block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-vertical";
    
    const variantClasses = {
      default: "bg-white dark:bg-black border-gray-300 dark:border-neutral-700 focus:ring-brand-start focus:border-brand-start",
      disabled: "bg-gray-50 dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base"
    };

    const textareaClasses = [
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
            htmlFor={textareaId} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export default Textarea; 