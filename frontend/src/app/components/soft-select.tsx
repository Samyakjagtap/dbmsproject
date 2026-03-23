import { forwardRef, SelectHTMLAttributes } from 'react';

interface SoftSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const SoftSelect = forwardRef<HTMLSelectElement, SoftSelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            rounded-xl px-4 py-3 
            bg-input-background 
            border-2 border-transparent
            shadow-[var(--soft-shadow-inset)]
            focus:border-primary focus:outline-none
            transition-all duration-200
            text-foreground
            ${error ? 'border-destructive' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-sm text-destructive">{error}</span>
        )}
      </div>
    );
  }
);

SoftSelect.displayName = 'SoftSelect';
