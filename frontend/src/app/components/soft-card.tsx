import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface SoftCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function SoftCard({ children, className = '', hover = false, gradient = false }: SoftCardProps) {
  const baseStyles = "rounded-2xl p-6 bg-card transition-all duration-300";
  const shadowStyles = "shadow-[var(--soft-shadow-md)]";
  const hoverStyles = hover ? "hover:shadow-[var(--soft-shadow-lg)] hover:scale-[1.02] cursor-pointer" : "";
  const gradientStyles = gradient ? "bg-gradient-to-br from-primary/10 to-secondary/10" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${shadowStyles} ${hoverStyles} ${gradientStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
}
