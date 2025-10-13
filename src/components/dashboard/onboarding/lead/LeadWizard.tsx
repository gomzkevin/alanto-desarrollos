import { WizardLayout } from "../shared/WizardLayout";
import { useLeadWizardState } from "./hooks/useLeadWizardState";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { OriginInterestStep } from "./steps/OriginInterestStep";
import { StatusFollowupStep } from "./steps/StatusFollowupStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useUserRole } from "@/hooks";

interface LeadWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEP_LABELS = ["Bienvenida", "Información del Prospecto", "Origen e Interés", "Estado y Seguimiento"];

export const LeadWizard = ({ open, onClose, onSuccess }: LeadWizardProps) => {
  const { userId, empresaId } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);

  const {
    state,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    saveToLocalStorage,
    clearDraft,
    canGoNext,
    isFirstStep,
    isLastStep,
    prepareDataForSave,
  } = useLeadWizardState(empresaId);

  const handleNext = async () => {
    if (isLastStep) {
      await handleFinish();
    } else {
      goToNextStep();
    }
  };

  const handleFinish = async () => {
    if (!userId || !empresaId) {
      toast.error("Error: No se pudo identificar el usuario");
      return;
    }

    setIsLoading(true);
    try {
      const leadData = prepareDataForSave(userId);

      // Ensure nombre is present (TypeScript validation)
      if (!leadData.nombre) {
        toast.error("El nombre del prospecto es requerido");
        return;
      }

      const { error } = await supabase.from("leads").insert([{
        ...leadData,
        nombre: leadData.nombre, // Explicitly set nombre as required
      }]);

      if (error) throw error;

      toast.success("¡Prospecto creado exitosamente!");
      clearDraft();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(error.message || "Error al crear el prospecto");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return (
          <ContactInfoStep
            data={state.data}
            errors={state.errors}
            onChange={updateData}
          />
        );
      case 2:
        return <OriginInterestStep data={state.data} onChange={updateData} />;
      case 3:
        return (
          <StatusFollowupStep
            data={state.data}
            errors={state.errors}
            onChange={updateData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardLayout
      open={open}
      onClose={onClose}
      totalSteps={4}
      currentStep={state.currentStep}
      completedSteps={state.completedSteps}
      stepLabels={STEP_LABELS}
      onStepClick={goToStep}
      onPrevious={goToPreviousStep}
      onNext={handleNext}
      onSaveDraft={saveToLocalStorage}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      canGoNext={canGoNext}
      isLoading={isLoading}
      nextButtonText={isLastStep ? "Crear Prospecto" : undefined}
    >
      {renderStep()}
    </WizardLayout>
  );
};
