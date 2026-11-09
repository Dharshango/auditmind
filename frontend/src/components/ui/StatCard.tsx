import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendConfig {
  value: string;
  direction: "up" | "down" | "neutral";
  isPositive?: boolean;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  subtext?: string;
  trend?: string | TrendConfig;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: "default" | "critical" | "warning" | "success" | "forest" | "citron" | "gold" | "teal";
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  unit,
  subtitle,
  subtext,
  trend,
  icon,
  badge,
  variant = "default",
  className = "",
  onClick,
}: StatCardProps) {
  const borderAccents = {
    default: "border-white/10 hover:border-white/20",
    critical: "border-red-500/30 hover:border-red-500/50",
    warning: "border-amber-500/30 hover:border-amber-500/50",
    success: "border-emerald-500/30 hover:border-emerald-500/50",
    forest: "border-white/15 hover:border-white/30",
    citron: "border-[#D5A6B5]/30 hover:border-[#D5A6B5]/60",
    gold: "border-[#D7A18D]/30 hover:border-[#D7A18D]/60",
    teal: "border-[#C6B9D8]/30 hover:border-[#C6B9D8]/60",
  };

  const displayText = subtitle || subtext;

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-xl border p-5 shadow-subtle transition-all duration-200 ${
        borderAccents[variant]
      } ${onClick ? "cursor-pointer active:scale-[0.99]" : ""} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-ink-secondary shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-ink-primary font-mono tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-ink-muted">{unit}</span>
          )}
        </div>
        {badge}
      </div>

      {(displayText || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
          {displayText && <span className="truncate">{displayText}</span>}
          {trend && (
            typeof trend === "string" ? (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-secondary">
                {trend === "up" && <TrendingUp className="w-3 h-3 text-status-success" />}
                {trend === "down" && <TrendingDown className="w-3 h-3 text-status-critical" />}
                {trend === "warning" && <TrendingDown className="w-3 h-3 text-status-warning" />}
                {trend === "neutral" && <Minus className="w-3 h-3 text-ink-muted" />}
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 font-medium font-mono text-[11px] shrink-0 ${
                  trend.direction === "neutral"
                    ? "text-ink-muted"
                    : trend.isPositive
                    ? "text-status-success"
                    : "text-status-critical"
                }`}
              >
                {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
                {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
                {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
                {trend.value}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}
