import React from "react";

export type ButtonVariant =
  | "primary"
  | "forest"
  | "secondary"
  | "citron"
  | "gold"
  | "teal"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-white/90 hover:bg-white text-black font-semibold border border-white/30 backdrop-blur-md shadow-[0_2px_12px_rgba(255,255,255,0.12)]",
    forest:
      "bg-white/90 hover:bg-white text-black font-semibold border border-white/30 backdrop-blur-md shadow-[0_2px_12px_rgba(255,255,255,0.12)]",
    secondary:
      "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-white/25 backdrop-blur-xl shadow-sm",
    citron:
      "bg-white/90 hover:bg-white text-black font-semibold border border-white/30 backdrop-blur-md shadow-sm",
    gold:
      "bg-white/90 hover:bg-white text-black font-semibold border border-white/30 backdrop-blur-md shadow-sm",
    teal:
      "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-white/25 backdrop-blur-xl shadow-sm",
    ghost:
      "bg-transparent text-zinc-300 hover:text-white hover:bg-white/10 border border-transparent backdrop-blur-sm",
    danger:
      "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white font-medium border border-rose-500/30 backdrop-blur-xl shadow-sm",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-xs px-2.5 py-1.5 rounded-md gap-1.5",
    md: "text-[13px] px-3.5 py-2 rounded-lg gap-2",
    lg: "text-sm px-5 py-2.5 rounded-lg gap-2.5 font-medium",
    icon: "p-2 rounded-lg",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}
