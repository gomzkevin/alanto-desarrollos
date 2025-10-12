import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WizardProgress } from "./WizardProgress";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface WizardLayoutProps {
  open: boolean;
  onClose: () => void;
  totalSteps: number;
  currentStep: number;
  completedSteps: Set<number>;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  children: ReactNode;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
  nextButtonText?: string;
}

export const WizardLayout = ({
  open,
  onClose,
  totalSteps,
  currentStep,
  completedSteps,
  stepLabels,
  onStepClick,
  onPrevious,
  onNext,
  onSaveDraft,
  children,
  isFirstStep,
  isLastStep,
  canGoNext,
  isLoading = false,
  nextButtonText,
}: WizardLayoutProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>{stepLabels[currentStep]}</DialogTitle>
          <DialogDescription>
            Paso {currentStep + 1} de {totalSteps}
          </DialogDescription>
        </VisuallyHidden>

        {/* Header con progreso */}
        <div className="flex-none border-b bg-background">
          <WizardProgress
            totalSteps={totalSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            stepLabels={stepLabels}
            onStepClick={onStepClick}
          />
        </div>

        {/* Contenido scrolleable con animación */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer con botones */}
        <div className="flex-none border-t px-6 py-4 bg-background">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onPrevious}
              disabled={isFirstStep || isLoading}
            >
              Atrás
            </Button>

            <div className="flex gap-2">
              {onSaveDraft && !isLastStep && (
                <Button
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={isLoading}
                >
                  Guardar borrador
                </Button>
              )}
              <Button
                onClick={onNext}
                disabled={!canGoNext || isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {nextButtonText || (isLastStep ? "Finalizar" : "Continuar")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
