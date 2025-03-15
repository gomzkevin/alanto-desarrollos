
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  formatCurrency?: boolean;
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatCurrency = false, value, onChange, ...props }, ref) => {
    // Para formateo de moneda - manejar valor de visualización
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

    // Manejador personalizado de cambios
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        if (formatCurrency) {
          // Para entradas con formato de moneda, extraer solo números
          const numericValue = e.target.value.replace(/[^0-9]/g, '');
          // Crear un evento sintético con el valor procesado
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: numericValue
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        } else {
          // Para entradas normales, pasar el evento tal cual
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
        value={formatCurrency ? displayValue : value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
export { Input }
