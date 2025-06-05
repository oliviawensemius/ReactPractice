// Updated Button component - frontend/components/ui/Button.tsx
import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean; // Add this prop
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  href, 
  onClick,
  className = '',
  type = 'button',
  disabled = false // Add default value
}) => {
  // Base styles for all buttons
  const baseStyle = "px-4 py-1 rounded-md transition-colors";
  
  // Styles for different variants
  const variantStyles = {
    primary: "bg-white text-emerald-800 hover:bg-emerald-100",
    secondary: "bg-emerald-800 text-white hover:bg-emerald-700",
    outline: "border border-white text-white hover:bg-emerald-700"
  };
  
  // Add disabled styles
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  // Combine styles
  const buttonStyle = `${baseStyle} ${variantStyles[variant]} ${disabledStyles} ${className}`;
  
  // If href is provided, render as Link (but not if disabled)
  if (href && !disabled) {
    return (
      <Link href={href} className={buttonStyle}>
        {children}
      </Link>
    );
  }
  
  // Otherwise, render as button
  return (
    <button 
      type={type} 
      onClick={disabled ? undefined : onClick} 
      className={buttonStyle}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;