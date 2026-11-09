import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-subtle p-5 sm:p-6 transition-all duration-200 ${
        hoverable
          ? "hover:border-white/20 hover:shadow-elevated cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  badge,
  action,
  className = "",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 pb-4 border-b border-border-subtle mb-4 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-ink-primary tracking-tight text-base">
            {title}
          </h3>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-ink-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
