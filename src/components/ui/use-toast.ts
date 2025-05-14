
// Re-export both toast implementations but with clearer names
import { useToast, toast as shadcnToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Export the shadcn toast hook
export { useToast };

// Export both toast implementations
export const toast = sonnerToast;
export const shadcnToast = shadcnToast;

