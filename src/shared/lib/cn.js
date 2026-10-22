import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard utility to conditionally join and merge Tailwind CSS class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
