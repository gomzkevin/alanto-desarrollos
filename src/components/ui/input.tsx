
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  formatCurrency?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatCurrency = false, ...props }, ref) => {
    // Para el formateo de moneda
    const displayValue = React.useMemo(() => {
      if (formatCurrency && props.value !== undefined && props.value !== '') {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0
        }).format(Number(props.value));
      }
      return props.value;
    }, [formatCurrency, props.value]);

    return (
      <input
        type={formatCurrency ? "text" : type}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        value={formatCurrency ? displayValue : props.value}
        onChange={(e) => {
          if (props.onChange) {
            if (formatCurrency) {
              // Para entradas de moneda, extraer solo números
              const numericValue = e.target.value.replace(/[^0-9]/g, '');
              
              // Crear un evento sintético con el valor procesado
              const syntheticEvent = {
                ...e,
                target: {
                  ...e.target,
                  value: numericValue
                }
              };
              
              props.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
            } else {
              props.onChange(e);
            }
          }
        }}
      />
    )
  }
)

Input.displayName = "Input"
export { Input }
