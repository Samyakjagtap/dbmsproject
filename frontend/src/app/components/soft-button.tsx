import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SoftButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function SoftButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  type = 'button',
  className = '',
}: SoftButtonProps) {
  const baseStyles = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2";
  
  const variantStyles = {
    primary: "bg-primary text-primary-foreground shadow-[var(--soft-shadow-sm)] hover:shadow-[var(--soft-shadow-md)]",
    secondary: "bg-secondary text-secondary-foreground shadow-[var(--soft-shadow-sm)] hover:shadow-[var(--soft-shadow-md)]",
    success: "bg-success text-success-foreground shadow-[var(--soft-shadow-sm)] hover:shadow-[var(--soft-shadow-md)]",
    danger: "bg-destructive text-destructive-foreground shadow-[var(--soft-shadow-sm)] hover:shadow-[var(--soft-shadow-md)]",
    ghost: "bg-transparent hover:bg-muted",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]";

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );
}
