import { WizardLayout } from "../shared/WizardLayout";
import { useFinancialWizardState } from "./hooks/useFinancialWizardState";
import { WelcomeFinancialStep } from "./steps/WelcomeFinancialStep";
import { BaseConfigStep } from "./steps/BaseConfigStep";
import { ExpensesStep } from "./steps/ExpensesStep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type Desarrollo = Tables<"desarrollos">;

interface ConfigFinancieraWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  desarrollo: Desarrollo;
}

const STEP_LABELS = ["Bienvenida", "Configuración Base", "Gastos e Impuestos"];

export const ConfigFinancieraWizard = ({
  open,
  onClose,
  onSuccess,
  desarrollo,
}: ConfigFinancieraWizardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    state,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canGoNext,
    isFirstStep,
    isLastStep,
  } = useFinancialWizardState({
    moneda: desarrollo.moneda || "MXN",
    adr_base: desarrollo.adr_base || undefined,
    ocupacion_anual: desarrollo.ocupacion_anual || undefined,
    comision_operador: desarrollo.comision_operador || undefined,
    mantenimiento_valor: desarrollo.mantenimiento_valor || undefined,
    es_mantenimiento_porcentaje: desarrollo.es_mantenimiento_porcentaje ?? true,
    gastos_fijos: desarrollo.gastos_fijos || undefined,
    es_gastos_fijos_porcentaje: desarrollo.es_gastos_fijos_porcentaje ?? false,
    gastos_variables: desarrollo.gastos_variables || undefined,
    es_gastos_variables_porcentaje: desarrollo.es_gastos_variables_porcentaje ?? true,
    impuestos: desarrollo.impuestos || undefined,
    es_impuestos_porcentaje: desarrollo.es_impuestos_porcentaje ?? true,
  });

  const handleNext = async () => {
    if (isLastStep) {
      await handleFinish();
    } else {
      goToNextStep();
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("desarrollos")
        .update({
          moneda: state.data.moneda,
          adr_base: state.data.adr_base,
          ocupacion_anual: state.data.ocupacion_anual,
          comision_operador: state.data.comision_operador,
          mantenimiento_valor: state.data.mantenimiento_valor,
          es_mantenimiento_porcentaje: state.data.es_mantenimiento_porcentaje,
          gastos_fijos: state.data.gastos_fijos,
          es_gastos_fijos_porcentaje: state.data.es_gastos_fijos_porcentaje,
          gastos_variables: state.data.gastos_variables,
          es_gastos_variables_porcentaje: state.data.es_gastos_variables_porcentaje,
          impuestos: state.data.impuestos,
          es_impuestos_porcentaje: state.data.es_impuestos_porcentaje,
        })
        .eq("id", desarrollo.id);

      if (error) throw error;

      toast.success("Configuración financiera guardada exitosamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating financial config:", error);
      toast.error(error.message || "Error al guardar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <WelcomeFinancialStep desarrolloNombre={desarrollo.nombre} />;
      case 1:
        return (
          <BaseConfigStep data={state.data} errors={state.errors} onChange={updateData} />
        );
      case 2:
        return <ExpensesStep data={state.data} errors={state.errors} onChange={updateData} />;
      default:
        return null;
    }
  };

  return (
    <WizardLayout
      open={open}
      onClose={onClose}
      totalSteps={3}
      currentStep={state.currentStep}
      completedSteps={state.completedSteps}
      stepLabels={STEP_LABELS}
      onStepClick={goToStep}
      onPrevious={goToPreviousStep}
      onNext={handleNext}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      canGoNext={canGoNext}
      isLoading={isLoading}
      nextButtonText={isLastStep ? "Guardar y Calcular Proyección" : undefined}
    >
      {renderStep()}
    </WizardLayout>
  );
};
