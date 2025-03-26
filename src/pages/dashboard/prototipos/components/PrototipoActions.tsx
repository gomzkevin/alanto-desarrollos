
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import AdminResourceDialog from "@/components/dashboard/AdminResourceDialog";

interface PrototipoActionsProps {
  desarrolloId?: string;
  onPrototipoAdded?: () => void;
}

const PrototipoActions = ({ desarrolloId, onPrototipoAdded }: PrototipoActionsProps) => {
  const { isAdmin } = useUserRole();
  
  // Only render the button if the user is an admin
  if (!isAdmin()) {
    return null;
  }
  
  return (
    <AdminResourceDialog 
      resourceType="prototipos"
      buttonText="Nuevo prototipo" 
      buttonIcon={<Plus className="h-4 w-4 mr-2" />}
      desarrolloId={desarrolloId}
      onSuccess={onPrototipoAdded}
    />
  );
};

export default PrototipoActions;
