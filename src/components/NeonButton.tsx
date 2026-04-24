import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

const neonButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-brand text-primary-foreground shadow-soft hover:shadow-glow hover:brightness-110",
        accent:
          "bg-accent text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.45)] hover:shadow-glow-accent hover:brightness-110",
        secondary:
          "glass text-foreground hover:border-primary/40 hover:shadow-soft",
        ghost:
          "bg-transparent text-foreground hover:bg-white/5",
        danger:
          "bg-destructive text-destructive-foreground hover:brightness-110 shadow-[0_0_24px_hsl(var(--destructive)/0.45)]",
        outline:
          "border border-primary/40 text-foreground hover:border-primary hover:shadow-soft hover:bg-primary/10",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base h-[52px]",
        xl: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  asChild?: boolean;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(neonButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
NeonButton.displayName = "NeonButton";

export { neonButtonVariants };
