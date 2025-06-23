import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  variant?: 'default' | 'sr-only';
  size?: 'sm' | 'md' | 'lg';
}

const Label: React.FC<LabelProps> = ({ 
  children, 
  required = false, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = "font-medium text-gray-700 dark:text-gray-300";
  
  const variantClasses = {
    default: "block",
    'sr-only': "sr-only"
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  const labelClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={labelClasses} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label; 