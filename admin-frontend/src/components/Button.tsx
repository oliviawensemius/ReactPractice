// admin-frontend/src/components/ui/Button.tsx
import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  href, 
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  loading = false
}) => {
  // Base styles for all buttons
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Size variants
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  // Variant styles
  const variantStyles = {
    primary: "bg-emerald-800 text-white hover:bg-emerald-900 focus:ring-emerald-500",
    secondary: "bg-white text-emerald-800 border border-emerald-800 hover:bg-emerald-50 focus:ring-emerald-500",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-emerald-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };
  
  // Combine styles
  const buttonStyle = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  
  // Loading spinner
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  // Button content with optional loading state
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );
  
  // If href is provided, render as Link (but not if disabled or loading)
  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={buttonStyle}>
        {buttonContent}
      </Link>
    );
  }
  
  // Otherwise, render as button
  return (
    <button 
      type={type} 
      onClick={disabled || loading ? undefined : onClick} 
      className={buttonStyle}
      disabled={disabled || loading}
    >
      {buttonContent}
    </button>
  );
};

export default Button;