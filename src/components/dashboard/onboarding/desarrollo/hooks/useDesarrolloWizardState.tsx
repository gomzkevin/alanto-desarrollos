import { useState, useCallback, useEffect } from "react";
import { WizardState, DesarrolloWizardData } from "../../shared/types/wizard.types";
import { toast } from "sonner";

const TOTAL_STEPS = 4;

export const useDesarrolloWizardState = (empresaId: number | null) => {
  const [state, setState] = useState<WizardState<DesarrolloWizardData>>({
    currentStep: 0,
    completedSteps: new Set(),
    data: {},
    errors: {},
  });

  // Cargar borrador desde localStorage al iniciar
  useEffect(() => {
    if (empresaId) {
      const saved = localStorage.getItem(`wizard_desarrollo_${empresaId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState({
            ...parsed,
            completedSteps: new Set(parsed.completedSteps || []),
          });
          toast.info("Se recuperó tu progreso anterior");
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, [empresaId]);

  // Guardar en localStorage cuando cambian los datos
  const saveToLocalStorage = useCallback(() => {
    if (empresaId) {
      const toSave = {
        ...state,
        completedSteps: Array.from(state.completedSteps),
      };
      localStorage.setItem(`wizard_desarrollo_${empresaId}`, JSON.stringify(toSave));
    }
  }, [state, empresaId]);

  const updateData = useCallback((field: keyof DesarrolloWizardData, value: any) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: "" }, // Limpiar error al editar
    }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Welcome - no validation
        return true;

      case 1: // Basic Info
        if (!state.data.nombre?.trim()) {
          errors.nombre = "El nombre es obligatorio";
        } else if (state.data.nombre.length < 3) {
          errors.nombre = "El nombre debe tener al menos 3 caracteres";
        }
        if (!state.data.ubicacion?.trim()) {
          errors.ubicacion = "La ubicación es obligatoria";
        }
        if (!state.data.total_unidades || state.data.total_unidades < 1) {
          errors.total_unidades = "Debe haber al menos 1 unidad";
        }
        break;

      case 2: // Amenities - no validation (optional)
        return true;

      case 3: // Dates & Media
        if (state.data.fecha_inicio && state.data.fecha_entrega) {
          if (new Date(state.data.fecha_entrega) <= new Date(state.data.fecha_inicio)) {
            errors.fecha_entrega = "La fecha de entrega debe ser posterior a la de inicio";
          }
        }
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
      saveToLocalStorage();
      return true;
    }
    return false;
  }, [state.currentStep, validateStep, saveToLocalStorage]);

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

  const clearDraft = useCallback(() => {
    if (empresaId) {
      localStorage.removeItem(`wizard_desarrollo_${empresaId}`);
    }
  }, [empresaId]);

  const canGoNext = useCallback(() => {
    // Always allow navigation from welcome step
    if (state.currentStep === 0) return true;

    // For other steps, validate
    return validateStep(state.currentStep);
  }, [state.currentStep, validateStep]);

  return {
    state,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateStep,
    saveToLocalStorage,
    clearDraft,
    canGoNext: canGoNext(),
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === TOTAL_STEPS - 1,
  };
};
