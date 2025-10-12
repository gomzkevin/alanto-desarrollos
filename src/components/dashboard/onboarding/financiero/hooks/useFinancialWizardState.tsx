import { useState, useCallback, useMemo } from "react";
import { WizardState, FinancialWizardData } from "../../shared/types/wizard.types";

const TOTAL_STEPS = 3;

export const useFinancialWizardState = (initialData?: Partial<FinancialWizardData>) => {
  const [state, setState] = useState<WizardState<FinancialWizardData>>({
    currentStep: 0,
    completedSteps: new Set(),
    data: {
      moneda: "MXN",
      es_mantenimiento_porcentaje: true,
      es_gastos_fijos_porcentaje: false,
      es_gastos_variables_porcentaje: true,
      es_impuestos_porcentaje: true,
      ...initialData,
    },
    errors: {},
  });

  const updateData = useCallback((field: keyof FinancialWizardData, value: any) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: "" },
    }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Welcome - no validation
        return true;

      case 1: // Base Config
        if (!state.data.moneda) {
          errors.moneda = "Selecciona una moneda";
        }
        if (!state.data.adr_base || state.data.adr_base <= 0) {
          errors.adr_base = "El ADR debe ser mayor a 0";
        }
        if (
          state.data.ocupacion_anual === undefined ||
          state.data.ocupacion_anual < 0 ||
          state.data.ocupacion_anual > 100
        ) {
          errors.ocupacion_anual = "La ocupación debe estar entre 0 y 100%";
        }
        if (
          state.data.comision_operador === undefined ||
          state.data.comision_operador < 0 ||
          state.data.comision_operador > 100
        ) {
          errors.comision_operador = "La comisión debe estar entre 0 y 100%";
        }
        break;

      case 2: // Expenses - all optional, just validate ranges if provided
        if (state.data.mantenimiento_valor !== undefined) {
          if (state.data.es_mantenimiento_porcentaje && (state.data.mantenimiento_valor < 0 || state.data.mantenimiento_valor > 100)) {
            errors.mantenimiento_valor = "El porcentaje debe estar entre 0 y 100";
          } else if (!state.data.es_mantenimiento_porcentaje && state.data.mantenimiento_valor < 0) {
            errors.mantenimiento_valor = "El monto no puede ser negativo";
          }
        }
        // Similar validations for other expense fields...
        break;
    }

    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors }));
      return false;
    }

    return true;
  }, [state.data]);

  const goToNextStep = useCallback(() => {
    if (!validateStep(state.currentStep)) {
      return false;
    }

    if (state.currentStep < TOTAL_STEPS - 1) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: new Set(prev.completedSteps).add(prev.currentStep),
        errors: {},
      }));
      return true;
    }
    return false;
  }, [state.currentStep, validateStep]);

  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 0) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        errors: {},
      }));
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS && state.completedSteps.has(step)) {
      setState((prev) => ({
        ...prev,
        currentStep: step,
        errors: {},
      }));
    }
  }, [state.completedSteps]);

  // Calculate canGoNext without modifying state
  const canGoNext = useMemo(() => {
    if (state.currentStep === 0) return true;

    // For step 1 (Base Config), check required fields
    if (state.currentStep === 1) {
      return !!(
        state.data.moneda &&
        state.data.adr_base &&
        state.data.adr_base > 0 &&
        state.data.ocupacion_anual !== undefined &&
        state.data.ocupacion_anual >= 0 &&
        state.data.ocupacion_anual <= 100 &&
        state.data.comision_operador !== undefined &&
        state.data.comision_operador >= 0 &&
        state.data.comision_operador <= 100
      );
    }

    // For step 2 (Expenses), always allow (all optional)
    return true;
  }, [state.currentStep, state.data]);

  return {
    state,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateStep,
    canGoNext,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === TOTAL_STEPS - 1,
  };
};
