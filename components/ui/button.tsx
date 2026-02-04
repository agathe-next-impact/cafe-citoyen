import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-lg transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default: "text-black uppercase font-bold underline bg-white",
        destructive: "bg-destructive focus-visible:ring-destructive/20",
        outline: "bg-background",
        secondary: "bg-secondary",
        ghost: "",
        link: "underline-offset-4",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-10 px-4",
        lg: "h-14 px-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }), "cursor-target")} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button }
