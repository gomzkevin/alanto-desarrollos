
export type ResourceType = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones' | 'unidades';

export type FormValues = Record<string, any>;

export interface AdminResourceDialogProps {
  resourceType: ResourceType;
  resourceId?: string;
  open?: boolean;
  onClose?: () => void;
  onSave?: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
  unidad_id?: string;
  defaultValues?: Record<string, any>;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'date' | 'image' | 'select-lead' | 'select-desarrollo' | 'select-prototipo';
  options?: FieldOption[];
  tab?: string;
}
