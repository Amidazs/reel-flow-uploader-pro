
// Re-export toast implementations from both libraries
import { useToast } from "@/hooks/use-toast";
import { toast as toastSonner } from "sonner";

// Export the useToast hook from shadcn/ui
export { useToast };

// Export sonner toast as the default toast implementation
export const toast = toastSonner;
