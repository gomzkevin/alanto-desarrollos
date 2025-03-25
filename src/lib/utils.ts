import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un valor numérico como moneda (MXN)
 * @param value - Valor numérico a formatear
 * @param minimumFractions - Número mínimo de decimales (default: 0)
 * @param maximumFractions - Número máximo de decimales (default: 0)
 */
export function formatCurrency(
  value: number | string | null | undefined, 
  minimumFractions: number = 0, 
  maximumFractions: number = 0
): string {
  if (value === null || value === undefined) return minimumFractions > 0 ? '$0.00' : '$0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: minimumFractions,
    maximumFractionDigits: maximumFractions,
  }).format(numValue);
}

// Función auxiliar para formatear con 2 decimales
export function formatCurrencyWithDecimals(value: number | string | null | undefined): string {
  return formatCurrency(value, 2, 2);
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

/**
 * Genera colores para gráficos según el nombre del conjunto de datos
 */
export function getDatasetColor(datasetName: string): string {
  const colorMap: Record<string, string> = {
    'Rendimiento Inmobiliario': '#8b5cf6', // Morado
    'Rendimiento Alternativo': '#0ea5e9', // Azul cielo
    'Ingresos': '#10b981', // Verde
    'Gastos': '#f97316', // Naranja
    'Utilidad': '#6366f1', // Índigo
    'Ocupación': '#8b5cf6', // Morado
  };
  
  return colorMap[datasetName] || '#8b5cf6'; // Morado por defecto
}

/**
 * Trunca un texto si supera cierta longitud y agrega "..."
 */
export function truncateText(text: string, maxLength: number = 20): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

/**
 * Formatea un texto para su visualización, reemplazando valores nulos/vacíos
 */
export function formatText(value: string | null | undefined, placeholder: string = '-'): string {
  if (value === null || value === undefined || value === '') return placeholder;
  return value;
}

/**
 * Formatea una fecha en formato amigable
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
}

/**
 * Formatea fecha y hora en formato amigable
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateStr;
  }
}

/**
 * Convierte un objeto a formato query string para URLs
 */
export function objectToQueryString(obj: Record<string, any>): string {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null && obj[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}
