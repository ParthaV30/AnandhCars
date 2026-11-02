/**
 * Shared button styles for consistent styling across Button component and Link elements
 */

export const buttonVariants = {
  primary: "bg-primary text-white hover:bg-primary-light focus:ring-primary",
  secondary: "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
  danger: "bg-error text-white hover:bg-error/90 focus:ring-error",
} as const;

export const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export const buttonBaseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function getButtonClasses(variant: ButtonVariant, size: ButtonSize): string {
  return `${buttonBaseStyles} ${buttonVariants[variant]} ${buttonSizes[size]}`;
}