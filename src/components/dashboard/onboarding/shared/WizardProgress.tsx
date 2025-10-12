import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: Set<number>;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
}

export const WizardProgress = ({
  totalSteps,
  currentStep,
  completedSteps,
  stepLabels,
  onStepClick,
}: WizardProgressProps) => {
  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i;
          const isCompleted = completedSteps.has(stepNumber);
          const isCurrent = currentStep === stepNumber;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Círculo del paso */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    "border-2",
                    isCurrent && "border-primary bg-primary text-primary-foreground scale-110",
                    isCompleted && !isCurrent && "border-primary bg-primary/10 text-primary",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 bg-muted text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-105"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepNumber + 1
                  )}
                </button>
                <span
                  className={cn(
                    "text-xs mt-2 text-center max-w-[80px] hidden sm:block",
                    isCurrent && "font-semibold text-foreground",
                    !isCurrent && "text-muted-foreground"
                  )}
                >
                  {stepLabels[stepNumber]}
                </span>
              </div>

              {/* Línea conectora */}
              {stepNumber < totalSteps - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-all",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
