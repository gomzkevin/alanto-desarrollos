import { useState, useCallback, useMemo, useEffect } from "react";
import { WizardState, LeadWizardData } from "../../shared/types/wizard.types";

const TOTAL_STEPS = 4;
const STORAGE_KEY_PREFIX = "wizard_lead_";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const useLeadWizardState = (empresaId?: number) => {
  const [state, setState] = useState<WizardState<LeadWizardData>>(() => {
    // Try to load from localStorage on init
    if (empresaId) {
      const storageKey = `${STORAGE_KEY_PREFIX}${empresaId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            completedSteps: new Set(parsed.completedSteps || []),
          };
        } catch (e) {
          console.error("Error parsing saved wizard state:", e);
        }
      }
    }

    // Default initial state
    return {
      currentStep: 0,
      completedSteps: new Set(),
      data: {
        estado: 'nuevo',
        fecha_creacion: new Date().toISOString(),
        ultimo_contacto: new Date().toISOString(),
      },
      errors: {},
    };
  });

  // Save to localStorage whenever state changes
  const saveToLocalStorage = useCallback(() => {
    if (!empresaId) return;
    
    const storageKey = `${STORAGE_KEY_PREFIX}${empresaId}`;
    const toSave = {
      ...state,
      completedSteps: Array.from(state.completedSteps),
    };
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  }, [state, empresaId]);

  // Auto-save on state change
  useEffect(() => {
    if (state.currentStep > 0) {
      saveToLocalStorage();
    }
  }, [state, saveToLocalStorage]);

  const updateData = useCallback((field: keyof LeadWizardData, value: any) => {
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

      case 1: // Contact Info
        if (!state.data.nombre || state.data.nombre.trim().length < 3) {
          errors.nombre = "El nombre debe tener al menos 3 caracteres";
        }
        
        if (!state.data.email && !state.data.telefono) {
          errors.contact = "Debes ingresar al menos email o teléfono";
        }
        
        if (state.data.email && !isValidEmail(state.data.email.trim())) {
          errors.email = "Email no válido";
        }
        break;

      case 2: // Origin & Interest - all optional
        return true;

      case 3: // Status
        if (!state.data.estado) {
          errors.estado = "Debes seleccionar un estado";
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
    if (step >= 0 && step < TOTAL_STEPS) {
      // Allow going to any completed step or the next step
      if (state.completedSteps.has(step) || step <= state.currentStep) {
        setState((prev) => ({
          ...prev,
          currentStep: step,
          errors: {},
        }));
      }
    }
  }, [state.completedSteps, state.currentStep]);

  const clearDraft = useCallback(() => {
    if (!empresaId) return;
    const storageKey = `${STORAGE_KEY_PREFIX}${empresaId}`;
    localStorage.removeItem(storageKey);
  }, [empresaId]);

  // Calculate canGoNext without modifying state
  const canGoNext = useMemo(() => {
    if (state.currentStep === 0) return true; // Welcome

    if (state.currentStep === 1) { // Contact Info
      const hasNombre = state.data.nombre?.trim() && state.data.nombre.trim().length >= 3;
      const hasValidEmail = state.data.email ? isValidEmail(state.data.email.trim()) : true;
      const hasContact = state.data.email?.trim() || state.data.telefono?.trim();
      return !!(hasNombre && hasContact && hasValidEmail);
    }

    if (state.currentStep === 2) { // Origin & Interest - all optional
      return true;
    }

    if (state.currentStep === 3) { // Status
      return !!state.data.estado;
    }

    return true;
  }, [state.currentStep, state.data]);

  const prepareDataForSave = useCallback((userId?: string) => {
    const finalData = { ...state.data };

    // Auto-assign agent to current user if not selected
    if (!finalData.agente && userId) {
      finalData.agente = userId;
    }

    // Ensure empresa_id
    if (!finalData.empresa_id && empresaId) {
      finalData.empresa_id = empresaId;
    }

    // Ensure dates
    if (!finalData.fecha_creacion) {
      finalData.fecha_creacion = new Date().toISOString();
    }
    if (!finalData.ultimo_contacto) {
      finalData.ultimo_contacto = new Date().toISOString();
    }

    return finalData;
  }, [state.data, empresaId]);

  return {
    state,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateStep,
    saveToLocalStorage,
    clearDraft,
    canGoNext,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === TOTAL_STEPS - 1,
    prepareDataForSave,
  };
};
