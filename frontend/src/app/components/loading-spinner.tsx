import { motion } from 'motion/react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-primary to-secondary`}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          maskImage: 'radial-gradient(circle, transparent 40%, black 41%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 41%)',
        }}
      />
    </div>
  );
}
