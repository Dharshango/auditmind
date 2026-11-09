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
      "bg-white hover:bg-zinc-200 text-black font-medium border border-white/20 shadow-sm",
    forest:
      "bg-white hover:bg-zinc-200 text-black font-medium border border-white/20 shadow-sm",
    secondary:
      "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 shadow-subtle",
    citron:
      "bg-white hover:bg-zinc-200 text-black font-medium border border-white/20 shadow-sm",
    gold:
      "bg-white hover:bg-zinc-200 text-black font-medium border border-white/20 shadow-sm",
    teal:
      "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 shadow-subtle",
    ghost:
      "bg-transparent text-zinc-300 hover:text-white hover:bg-white/10 border border-transparent",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white font-medium border border-transparent shadow-subtle",
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
