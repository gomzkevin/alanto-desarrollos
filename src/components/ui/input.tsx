import * as React from "react"
import { cn } from "@/lib/utils"
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  formatCurrency?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatCurrency, value, onChange, readOnly, ...props }, ref) => {
    // Format value as currency if requested
    const displayValue = formatCurrency && value !== undefined && value !== null 
      ? (typeof value === 'number' ? formatCurrencyUtil(value) : value)
      : value;
    
    // Custom handler for currency formatting
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (formatCurrency && onChange) {
        // Keep original event, but update the displayed value for currency input
        onChange(e);
      } else if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          readOnly ? "bg-gray-100 cursor-not-allowed" : "",
          className
        )}
        value={displayValue}
        onChange={handleChange}
        readOnly={readOnly}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
