
import * as React from "react"
import { cn } from "@/lib/utils"
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  formatCurrency?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatCurrency, value, readOnly, ...props }, ref) => {
    // Format value as currency if requested
    const displayValue = formatCurrency && value !== undefined && value !== null 
      ? (typeof value === 'number' ? formatCurrencyUtil(value) : value)
      : value;

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          readOnly ? "bg-gray-100 cursor-not-allowed" : "",
          className
        )}
        value={displayValue}
        readOnly={readOnly}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
