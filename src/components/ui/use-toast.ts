
// Re-export toast implementations from both libraries
import { useToast, toast as shadcnToastOriginal } from "@/hooks/use-toast";
import { toast as sonnerToastOriginal } from "sonner";

// Export the shadcn toast hook
export { useToast };

// Export sonner toast as the default toast implementation
export const toast = sonnerToastOriginal;

// Export shadcn toast with a different name to avoid conflicts
export const shadcnToast = shadcnToastOriginal;
