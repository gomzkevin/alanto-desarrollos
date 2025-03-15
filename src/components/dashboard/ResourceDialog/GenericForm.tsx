
import { FormValues } from './types';

interface GenericFormProps {
  fields: any[];
  resource: FormValues | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  resourceType: string;
  resourceId?: string;
  desarrolloId?: string;
}

export default function GenericForm({
  fields,
  resource,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  resourceType,
  resourceId,
  desarrolloId
}: GenericFormProps) {
  if (!resource) return null;
  
  // Currently this is a placeholder until we implement specific forms
  // for the other resource types
  return (
    <div className="grid gap-4 py-4">
      <p className="text-md text-center">
        El formulario para {resourceType} está en desarrollo.
        Pronto tendrá disponible todas las funcionalidades.
      </p>
    </div>
  );
}
