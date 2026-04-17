import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/80",
      secondary: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
      destructive: "border-transparent bg-red-500 text-neutral-50 shadow hover:bg-red-500/80",
      success: "border-transparent bg-green-500 text-neutral-50 shadow hover:bg-green-500/80",
      warning: "border-transparent bg-yellow-500 text-neutral-50 shadow hover:bg-yellow-500/80",
      outline: "text-neutral-950",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
