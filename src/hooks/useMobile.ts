
// Re-export the hook from use-mobile.tsx for backwards compatibility
import { useIsMobile } from "./use-mobile";

// Export the hook with a consistent name
export const useMobile = useIsMobile;
export default useMobile;
