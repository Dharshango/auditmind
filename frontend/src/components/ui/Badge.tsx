import React from "react";

export type BadgeVariant =
  | "forest"
  | "citron"
  | "sage"
  | "slate"
  | "terracotta"
  | "critical"
  | "warning"
  | "success"
  | "info"
  | "gold"
  | "teal"
  | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
  dot = false,
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    forest:
      "bg-[#18181B] text-white border border-white/15",
    citron:
      "bg-[#18181B] text-[#D5A6B5] border border-[#D5A6B5]/30",
    sage:
      "bg-[#18181B] text-[#C6B9D8] border border-[#C6B9D8]/30",
    slate:
      "bg-[#18181B] text-[#C8C8C8] border border-white/10",
    terracotta:
      "bg-[#18181B] text-[#D7A18D] border border-[#D7A18D]/30",
    critical:
      "bg-red-950/40 text-[#F87171] border border-red-500/30",
    warning:
      "bg-amber-950/40 text-[#FBBF24] border border-amber-500/30",
    success:
      "bg-emerald-950/40 text-[#4ADE80] border border-emerald-500/30",
    info:
      "bg-blue-950/40 text-[#60A5FA] border border-blue-500/30",
    // Backward-compatible aliases
    gold:
      "bg-[#18181B] text-[#D7A18D] border border-[#D7A18D]/30",
    teal:
      "bg-[#18181B] text-[#C6B9D8] border border-[#C6B9D8]/30",
    neutral:
      "bg-[#18181B] text-[#C8C8C8] border border-white/10",
  };

  const dotColors: Record<BadgeVariant, string> = {
    forest: "bg-white",
    citron: "bg-[#D5A6B5]",
    sage: "bg-[#C6B9D8]",
    slate: "bg-[#8E8E8E]",
    terracotta: "bg-[#D7A18D]",
    critical: "bg-[#F87171]",
    warning: "bg-[#FBBF24]",
    success: "bg-[#4ADE80]",
    info: "bg-[#60A5FA]",
    gold: "bg-[#D7A18D]",
    teal: "bg-[#C6B9D8]",
    neutral: "bg-[#8E8E8E]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md tracking-tight select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`}
        />
      )}
      {children}
    </span>
  );
}
