import { LucideIcon } from 'lucide-react';
import { SoftButton } from './soft-button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 shadow-[var(--soft-shadow-md)] flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-2xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <SoftButton onClick={onAction} variant="primary">
          {actionLabel}
        </SoftButton>
      )}
    </div>
  );
}
