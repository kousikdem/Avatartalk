
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
        destructive: "bg-gradient-to-r from-red-400 via-pink-400 to-rose-500 hover:from-red-500 hover:via-pink-500 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
        outline: "border border-slate-200 bg-gradient-to-r from-white/90 to-slate-50/60 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900 hover:border-blue-300 shadow-sm hover:shadow-md backdrop-blur-sm",
        secondary: "bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-50 hover:from-slate-200 hover:via-blue-100 hover:to-indigo-100 text-slate-900 shadow-lg hover:shadow-xl transform hover:scale-105",
        ghost: "hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 hover:text-slate-900 transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 hover:no-underline hover:px-2 hover:py-1 hover:rounded transition-all duration-300",
        accent: "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
