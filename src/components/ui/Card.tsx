import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
  className?: string;
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-white dark:bg-slate-950 shadow-md',
  outlined: 'border border-gray-200 bg-white dark:bg-slate-950',
};

export const Card: React.FC<CardProps> = ({ children, variant = 'default', className }) => {
  return <div className={cn('rounded-lg p-6', variantStyles[variant], className)}>{children}</div>;
};

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={cn('mb-4', className)}>
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn('flex-1', className)}>{children}</div>;
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>{children}</div>;
};
