import React from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  asChild = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "text-white bg-gradient-to-r from-brand-start to-brand-end hover:brightness-110 focus:ring-brand-start border border-transparent",
    secondary: "text-gray-700 dark:text-gray-300 bg-white dark:bg-black border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-900 focus:ring-brand-start",
    outline: "text-brand-start border border-brand-start bg-transparent hover:bg-brand-start hover:text-white focus:ring-brand-start",
    ghost: "text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-900 focus:ring-gray-500",
    danger: "text-white bg-red-600 border border-transparent hover:bg-red-700 focus:ring-red-500"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  if (asChild) {
    return (
      <Slot
        className={buttonClasses}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button; 