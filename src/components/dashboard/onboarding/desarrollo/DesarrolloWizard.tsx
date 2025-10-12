import { WizardLayout } from "../shared/WizardLayout";
import { useDesarrolloWizardState } from "./hooks/useDesarrolloWizardState";
import { WelcomeStep } from "./steps/WelcomeStep";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { AmenitiesStep } from "./steps/AmenitiesStep";
import { DatesMediaStep } from "./steps/DatesMediaStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useUserRole } from "@/hooks";

interface DesarrolloWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEP_LABELS = ["Bienvenida", "Información Básica", "Características", "Fechas y Media"];

export const DesarrolloWizard = ({ open, onClose, onSuccess }: DesarrolloWizardProps) => {
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
  } = useDesarrolloWizardState(empresaId);

  const handleNext = async () => {
    if (isLastStep) {
      // Crear el desarrollo
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
      const desarrolloData = {
        nombre: state.data.nombre!,
        ubicacion: state.data.ubicacion!,
        total_unidades: state.data.total_unidades!,
        unidades_disponibles: state.data.total_unidades!, // Inicialmente todas disponibles
        descripcion: state.data.descripcion || null,
        amenidades: state.data.amenidades || [],
        fecha_inicio: state.data.fecha_inicio || null,
        fecha_entrega: state.data.fecha_entrega || null,
        imagen_url: state.data.imagen_url || null,
        empresa_id: empresaId,
        user_id: userId,
        avance_porcentaje: 0,
      };

      const { error } = await supabase.from("desarrollos").insert([desarrolloData]);

      if (error) throw error;

      toast.success("¡Desarrollo creado exitosamente!");
      clearDraft();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating desarrollo:", error);
      toast.error(error.message || "Error al crear el desarrollo");
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
          <BasicInfoStep
            data={state.data}
            errors={state.errors}
            onChange={updateData}
          />
        );
      case 2:
        return <AmenitiesStep data={state.data} onChange={updateData} />;
      case 3:
        return (
          <DatesMediaStep
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
      nextButtonText={isLastStep ? "Crear Desarrollo" : undefined}
    >
      {renderStep()}
    </WizardLayout>
  );
};
