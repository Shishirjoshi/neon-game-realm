import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString()}`;
}
