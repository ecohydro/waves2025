import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
}

const sizeStyles = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const variantStyles = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
};

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  size = 'md',
  variant = 'default',
  className,
  disabled,
  ...props
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  const finalVariant = hasError ? 'error' : variant;

  const inputStyles = cn(
    'w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizeStyles[size],
    variantStyles[finalVariant],
    disabled && 'opacity-50 cursor-not-allowed',
    icon && 'pl-10',
    className,
  );

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input id={inputId} className={inputStyles} disabled={disabled} {...props} />
      </div>
      {helperText && !hasError && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
