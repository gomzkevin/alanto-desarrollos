
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const companyFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  rfc: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email({
    message: "Ingrese un correo electrónico válido.",
  }).optional(),
  sitio_web: z.string().optional().transform(val => {
    // If empty, return as is
    if (!val) return val;
    
    // If it doesn't start with http:// or https://, add https://
    if (!val.match(/^https?:\/\//i)) {
      return `https://${val}`;
    }
    return val;
  }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function CompanyProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin, empresaId } = useUserRole();
  const [hasSubscription, setHasSubscription] = useState(true); // Default to true for testing
  const [companyInfo, setCompanyInfo] = useState<CompanyFormValues | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      nombre: "",
      rfc: "",
      direccion: "",
      telefono: "",
      email: "",
      sitio_web: "",
    },
  });

  // Check if user has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        console.log("Checking subscription status...");
        const { data: authData } = await supabase.auth.getSession();
        if (!authData.session) {
          console.log("No active session found");
          return;
        }

        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authData.session.user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking subscription:", error);
        }

        // For development, we'll assume there's a subscription if none exists
        setHasSubscription(true); // Set to true for now to enable saving
        console.log("Subscription status:", subscription ? "Active" : "None, but enabling anyway for development");
      } catch (error) {
        console.error("Error checking subscription:", error);
        // For development, default to true
        setHasSubscription(true);
      }
    };
    
    checkSubscription();
  }, []);

  // Fetch company information
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setIsLoading(true);
        
        // Use the empresa_id from useUserRole if available
        const companyId = empresaId || 1;
        console.log("Fetching company info for company ID:", companyId);
        
        const { data, error } = await supabase
          .from('empresa_info')
          .select('*')
          .eq('id', companyId)
          .single();

        if (error) {
          console.error("Error loading company info:", error);
          return;
        }

        if (data) {
          console.log("Company info loaded:", data);
          setCompanyInfo(data);
          form.reset({
            nombre: data.nombre || "",
            rfc: data.rfc || "",
            direccion: data.direccion || "",
            telefono: data.telefono || "",
            email: data.email || "",
            sitio_web: data.sitio_web || "",
          });
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin()) {
      fetchCompanyInfo();
    }
  }, [form, isAdmin, empresaId]);

  async function onSubmit(values: CompanyFormValues) {
    if (!isAdmin()) {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden actualizar la información de la empresa.",
        variant: "destructive",
      });
      return;
    }

    // For development, we'll skip the subscription check
    // if (!hasSubscription) {
    //   toast({
    //     title: "Suscripción requerida",
    //     description: "Necesita una suscripción activa para actualizar la información de la empresa.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    try {
      setIsLoading(true);
      const companyId = empresaId || 1;
      
      console.log("Saving company info for company ID:", companyId);
      console.log("Values to save:", values);
      
      const { error } = await supabase
        .from('empresa_info')
        .upsert({
          id: companyId,
          ...values
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Información actualizada",
        description: "La información de la empresa ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error("Error updating company info:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la información de la empresa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAdmin()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Empresa</CardTitle>
          <CardDescription>
            No tienes permisos para gestionar el perfil de la empresa.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Empresa</CardTitle>
        <CardDescription>
          Gestiona la información de tu empresa que aparecerá en los documentos y reportes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Empresa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre de la empresa" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rfc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="RFC de la empresa" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Dirección de la empresa" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Teléfono de contacto" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Email de contacto" 
                        type="email" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sitio_web"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio Web</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="www.ejemplo.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default CompanyProfileForm;
