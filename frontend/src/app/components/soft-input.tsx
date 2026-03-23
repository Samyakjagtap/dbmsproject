import { forwardRef, InputHTMLAttributes } from 'react';

interface SoftInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const SoftInput = forwardRef<HTMLInputElement, SoftInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            rounded-xl px-4 py-3 
            bg-input-background 
            border-2 border-transparent
            shadow-[var(--soft-shadow-inset)]
            focus:border-primary focus:outline-none
            transition-all duration-200
            placeholder:text-muted-foreground
            ${error ? 'border-destructive' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-sm text-destructive">{error}</span>
        )}
      </div>
    );
  }
);

SoftInput.displayName = 'SoftInput';
