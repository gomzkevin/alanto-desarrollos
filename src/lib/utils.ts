import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un valor numérico como moneda (MXN)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '$0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

/**
 * Formatea un valor numérico como moneda abreviada (k, M, etc.)
 */
export function formatCurrencyShort(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '$0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue >= 1000000) {
    return formatCurrency(Math.round(numValue / 1000000)) + 'M';
  } else if (numValue >= 1000) {
    return formatCurrency(Math.round(numValue / 1000)) + 'k';
  }
  
  return formatCurrency(numValue);
}

/**
 * Formatea un número para mostrar separadores de miles
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

/**
 * Formatea un valor como porcentaje
 */
export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(numValue / 100);
}
