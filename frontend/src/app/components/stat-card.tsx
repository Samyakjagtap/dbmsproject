import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, gradient, trend, trendUp }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="p-6 rounded-2xl bg-card shadow-[var(--soft-shadow-md)] hover:shadow-[var(--soft-shadow-lg)] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shadow-[var(--soft-shadow-sm)] flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <span className={`text-sm font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trend}
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
