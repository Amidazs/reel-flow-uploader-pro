
// Re-export both toast implementations 
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export { useShadcnToast as useToast, sonnerToast as toast };
