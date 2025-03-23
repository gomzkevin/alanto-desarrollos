
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString: string, formatString: string = "dd/MM/yyyy") {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return format(date, formatString, { locale: es });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Format currency using Intl
 */
export function formatCurrency(amount: number) {
  if (amount === undefined || amount === null) return "$0";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string) {
  return Number(value.replace(/[^0-9.-]+/g, ""));
}

/**
 * Truncate a string if it exceeds a certain length
 */
export function truncateString(str: string, maxLength: number = 100) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(string: string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Format percentage from decimal to percentage string
 */
export function formatPercentage(decimal: number) {
  return `${(decimal * 100).toFixed(0)}%`;
}

/**
 * Generate a random hex color
 */
export function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string) {
  if (!name) return "";
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}
