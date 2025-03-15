
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  formatCurrency?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string | number | readonly string[];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatCurrency = false, onChange, value, ...props }, ref) => {
    // For currency formatting - handle display value
    const displayValue = React.useMemo(() => {
      if (formatCurrency && value !== undefined && value !== '') {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0
        }).format(Number(value));
      }
      return value;
    }, [formatCurrency, value]);

    // Create a custom onChange handler for currency formatting
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        if (formatCurrency) {
          // For currency inputs, extract only numbers
          const numericValue = e.target.value.replace(/[^0-9]/g, '');
          // Create a synthetic event with the processed value
          const syntheticEvent = Object.create(e);
          Object.defineProperty(syntheticEvent, 'target', {
            writable: true,
            value: { ...e.target, value: numericValue }
          });
          onChange(syntheticEvent);
        } else {
          // For normal inputs, pass the event as is
          onChange(e);
        }
      }
    };

    return (
      <input
        type={formatCurrency ? "text" : type}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        value={formatCurrency ? displayValue : value}
        onChange={handleInputChange}
      />
    )
  }
)

Input.displayName = "Input"
export { Input }
