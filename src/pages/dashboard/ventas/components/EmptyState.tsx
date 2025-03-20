
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center border rounded-lg bg-muted/10">
      <div className="p-4 rounded-full bg-primary/10">
        <FileText className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">No hay ventas registradas</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Las ventas se crean automáticamente cuando una unidad cambia su estado a "apartado" o "en proceso".
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/desarrollos')}
        >
          Ver desarrollos
        </Button>
        <Button
          onClick={() => navigate('/dashboard/prototipos')}
        >
          Gestionar prototipos
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
