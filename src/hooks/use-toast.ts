
// This implementation is inspired by shadcn/ui toast pattern but simplified for our needs
import { useState, useEffect, createContext, useContext } from "react";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, ...props }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Handle custom events from global toast method
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      toast(event.detail);
    };

    // Add data attribute to help identify the toast context provider in the DOM
    const element = document.querySelector('[data-toast-context]');
    if (element) {
      element.addEventListener('toast', handleToastEvent as EventListener);
      
      return () => {
        element.removeEventListener('toast', handleToastEvent as EventListener);
      };
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }} data-toast-context="true">
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
};

// For direct usage without hooks
export const toast = {
  show: (props: Omit<ToastProps, "id">) => {
    // Get the toast function from the global context if available
    const toastContext = document.querySelector('[data-toast-context="true"]');
    
    if (toastContext) {
      const event = new CustomEvent('toast', { detail: props });
      toastContext.dispatchEvent(event);
    } else {
      console.warn('Toast provider not found. Toast messages require ToastProvider to be present in the component tree.');
    }
  }
};
