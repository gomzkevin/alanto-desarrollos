
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  onChange?: (value: any) => void;
  formatCurrency?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, formatCurrency = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number' && formatCurrency) {
        // For currency formatting, we process the input differently
        const value = e.target.value;
        // Remove all non-numeric characters
        const numericValue = value.replace(/[^0-9]/g, '');
        
        if (onChange) {
          // Pass the numeric value to the consumer
          onChange(Number(numericValue));
        }
      } else if (onChange) {
        // For normal inputs, pass the event value directly
        onChange(e.target.value);
      }
    };

    // Format display value for currency
    const formatValue = () => {
      if (type === 'number' && formatCurrency && props.value !== undefined) {
        return new Intl.NumberFormat('es-MX', {
          maximumFractionDigits: 0
        }).format(Number(props.value));
      }
      return props.value;
    };

    return (
      <input
        type={formatCurrency ? "text" : type}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={formatValue()}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
