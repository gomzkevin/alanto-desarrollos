
import * as React from "react"
import { cn } from "@/lib/utils"
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  formatCurrency?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatCurrency, value, onChange, readOnly, ...props }, ref) => {
    // Store the numeric value separately from the displayed value for currency formatting
    const [rawValue, setRawValue] = React.useState<string>(value?.toString() || '');
    
    // Initialize rawValue when value prop changes externally
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        setRawValue(value.toString());
      }
    }, [value]);

    // Handle display of formatted currency
    let displayValue = value;
    if (formatCurrency && type === 'number' && rawValue !== '') {
      // Format the displayed value for currency
      const numValue = parseFloat(rawValue);
      if (!isNaN(numValue)) {
        displayValue = formatCurrencyUtil(numValue);
      } else {
        displayValue = rawValue;
      }
    }
    
    // Custom handler for currency formatting
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (formatCurrency && type === 'number') {
        const inputValue = e.target.value;
        // Remove non-numeric characters for processing
        const numericValue = inputValue.replace(/[^0-9.]/g, '');
        
        // Update the raw value state
        setRawValue(numericValue);
        
        // Create a synthetic event with the numeric value for the parent component
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: numericValue
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        if (onChange) {
          onChange(syntheticEvent);
        }
      } else if (onChange) {
        onChange(e);
      }
    };

    // For currency fields, we need to use text type instead of number to show formatted text
    const inputType = formatCurrency && type === 'number' ? 'text' : type;

    return (
      <input
        type={inputType}
        className={cn(
          "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:border-indigo-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors shadow-sm",
          readOnly ? "bg-gray-50 cursor-not-allowed" : "",
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
