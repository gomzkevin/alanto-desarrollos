
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function TestSubscriptionCreator() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [planType, setPlanType] = useState<"desarrollo" | "prototipo">("desarrollo");
  const [planId, setPlanId] = useState<string>("");
  const [plans, setPlans] = useState<any[]>([]);
  const [pricePerUnit, setPricePerUnit] = useState<number>(100);
  const { userId, empresaId } = useUserRole();

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price");

      if (error) throw error;
      setPlans(data || []);
      
      // Si hay planes, seleccionar el primero por defecto
      if (data && data.length > 0) {
        setPlanId(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando planes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes de suscripción",
        variant: "destructive",
      });
    }
  };

  const handleOpen = async () => {
    await loadPlans();
    setOpen(true);
  };

  const createTestSubscription = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una suscripción de prueba",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke("create-test-subscription", {
        body: {
          userId,
          planType,
          planId,
          pricePerUnit,
          empresaId,
        },
      });

      if (error) throw error;

      toast({
        title: "Suscripción creada",
        description: "La suscripción de prueba ha sido creada correctamente",
      });
      
      setOpen(false);
      
      // Recargar la página para mostrar la nueva suscripción
      window.location.reload();
    } catch (error) {
      console.error("Error creando suscripción de prueba:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la suscripción de prueba",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleOpen}>
        Crear Suscripción de Prueba
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Suscripción de Prueba</DialogTitle>
            <DialogDescription>
              Esta herramienta crea una suscripción de prueba en Stripe para simular un usuario con suscripción activa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planType" className="text-right">
                Tipo de Plan
              </Label>
              <Select
                value={planType}
                onValueChange={(value: "desarrollo" | "prototipo") => setPlanType(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona el tipo de plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desarrollo">Plan por Desarrollo</SelectItem>
                  <SelectItem value="prototipo">Plan por Prototipos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                Plan
              </Label>
              <Select
                value={planId}
                onValueChange={setPlanId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (${plan.price}/{plan.interval})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricePerUnit" className="text-right">
                Precio por Unidad
              </Label>
              <Input
                id="pricePerUnit"
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={createTestSubscription}
              disabled={isLoading}
            >
              {isLoading ? "Creando..." : "Crear Suscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TestSubscriptionCreator;
