// src/components/ui/Button.tsx
import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  href, 
  onClick,
  className = '',
  type = 'button'
}) => {
  // Base styles for all buttons
  const baseStyle = "px-4 py-1 rounded-md transition-colors";
  
  // Styles for different variants
  const variantStyles = {
    primary: "bg-white text-emerald-800 hover:bg-emerald-100",
    secondary: "bg-emerald-800 text-white hover:bg-emerald-700",
    outline: "border border-white text-white hover:bg-emerald-700"
  };
  
  // Combine styles
  const buttonStyle = `${baseStyle} ${variantStyles[variant]} ${className}`;
  
  // If href is provided, render as Link
  if (href) {
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
      onClick={onClick} 
      className={buttonStyle}
    >
      {children}
    </button>
  );
};

export default Button;