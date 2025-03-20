
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUserRole } from '@/hooks/useUserRole';

const NuevaCotizacion = () => {
  const navigate = useNavigate();
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [newLeadData, setNewLeadData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [selectedDesarrollo, setSelectedDesarrollo] = useState<any>(null);
  const [selectedPrototipo, setSelectedPrototipo] = useState<any>(null);
  const [anticipoAmount, setAnticipoAmount] = useState(0);
  const [numberOfPayments, setNumberOfPayments] = useState(6);
  const [useFiniquito, setUseFiniquito] = useState(false);
  const [finiquitoAmount, setFiniquitoAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [finiquitoDate, setFiniquitoDate] = useState<Date | undefined>(undefined);
  const { empresaId } = useUserRole();

  const { leads } = useLeads({ empresa_id: empresaId });
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ desarrolloId: selectedDesarrollo?.id });

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "PPP", { locale: es });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      let leadId = selectedLead?.id;
      
      if (!isExistingClient && newLeadData.nombre) {
        const { data: createdLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            nombre: newLeadData.nombre,
            email: newLeadData.email || null,
            telefono: newLeadData.telefono || null,
            estado: 'nuevo',
            empresa_id: empresaId
          })
          .select()
          .single();
        
        if (leadError) {
          throw new Error(`Error al crear cliente: ${leadError.message}`);
        }
        
        leadId = createdLead.id;
      }
      
      const { data: cotizacion, error: cotizacionError } = await supabase
        .from('cotizaciones')
        .insert({
          lead_id: leadId,
          desarrollo_id: selectedDesarrollo?.id,
          prototipo_id: selectedPrototipo?.id,
          monto_anticipo: anticipoAmount,
          numero_pagos: numberOfPayments,
          usar_finiquito: useFiniquito,
          monto_finiquito: useFiniquito ? finiquitoAmount : null,
          notas: notes,
          fecha_inicio_pagos: startDate.toISOString(),
          fecha_finiquito: useFiniquito && finiquitoDate ? finiquitoDate.toISOString() : null,
          empresa_id: empresaId
        })
        .select();
      
      if (cotizacionError) {
        throw new Error(`Error al crear cotización: ${cotizacionError.message}`);
      }
      
      toast({
        title: "Cotización creada",
        description: "La cotización se ha creado correctamente."
      });
      
      navigate('/dashboard/cotizaciones');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la cotización",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="container py-10">
        <h1 className="text-3xl font-semibold mb-6">Nueva Cotización</h1>
        <form onSubmit={handleSubmit}>
          <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-semibold text-indigo-900">Información del Cliente</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Selecciona un cliente existente o crea uno nuevo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center space-x-2 p-2 rounded-md">
                <Switch
                  id="isExistingClient"
                  checked={isExistingClient}
                  onCheckedChange={setIsExistingClient}
                />
                <Label htmlFor="isExistingClient" className="font-medium">Cliente existente</Label>
              </div>

              {isExistingClient ? (
                <div className="space-y-3">
                  <Label htmlFor="lead" className="text-gray-700">Seleccionar cliente</Label>
                  <Select onValueChange={(value) => {
                    const selected = leads.find(lead => lead.id === value);
                    setSelectedLead(selected);
                  }}>
                    <SelectTrigger className="w-full border border-gray-200 shadow-sm">
                      <SelectValue placeholder="Selecciona un cliente" defaultValue={selectedLead?.id} />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="nombre" className="text-gray-700">Nombre completo</Label>
                    <Input
                      id="nombre"
                      placeholder="Nombre completo"
                      value={newLeadData.nombre}
                      onChange={(e) => setNewLeadData({ ...newLeadData, nombre: e.target.value })}
                      className="border border-gray-200 shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-gray-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={newLeadData.email}
                        onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                        className="border border-gray-200 shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="telefono" className="text-gray-700">Teléfono</Label>
                      <Input
                        id="telefono"
                        placeholder="+52 55 1234 5678"
                        value={newLeadData.telefono}
                        onChange={(e) => setNewLeadData({ ...newLeadData, telefono: e.target.value })}
                        className="border border-gray-200 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6 border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-semibold text-indigo-900">Información de la Propiedad</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Selecciona el desarrollo y prototipo para la cotización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="desarrollo" className="text-gray-700">Desarrollo</Label>
                  <Select onValueChange={(value) => {
                    const selected = desarrollos.find(desarrollo => desarrollo.id === value);
                    setSelectedDesarrollo(selected);
                    setSelectedPrototipo(null);
                  }}>
                    <SelectTrigger className="w-full border border-gray-200 shadow-sm">
                      <SelectValue placeholder="Selecciona un desarrollo" defaultValue={selectedDesarrollo?.id} />
                    </SelectTrigger>
                    <SelectContent>
                      {desarrollos.map((desarrollo) => (
                        <SelectItem key={desarrollo.id} value={desarrollo.id}>
                          {desarrollo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="prototipo" className="text-gray-700">Prototipo</Label>
                  <Select 
                    onValueChange={(value) => {
                      const selected = prototipos.find(prototipo => prototipo.id === value);
                      setSelectedPrototipo(selected);
                    }}
                    disabled={!selectedDesarrollo}
                  >
                    <SelectTrigger className="w-full border border-gray-200 shadow-sm">
                      <SelectValue placeholder="Selecciona un prototipo" defaultValue={selectedPrototipo?.id} />
                    </SelectTrigger>
                    <SelectContent>
                      {prototipos.map((prototipo) => (
                        <SelectItem key={prototipo.id} value={prototipo.id}>
                          {prototipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-semibold text-indigo-900">Detalles de pago</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Configura el anticipo, mensualidades y otros detalles de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="anticipoAmount" className="text-gray-700">Monto de anticipo</Label>
                  <Input
                    id="anticipoAmount"
                    formatCurrency
                    value={anticipoAmount}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      setAnticipoAmount(Number(numericValue));
                    }}
                    className="border border-gray-200 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="numberOfPayments" className="text-gray-700">Número de mensualidades</Label>
                  <Input
                    id="numberOfPayments"
                    type="number"
                    value={numberOfPayments}
                    onChange={(e) => setNumberOfPayments(Number(e.target.value))}
                    className="border border-gray-200 shadow-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-gray-700">Fecha de inicio de pagos</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border border-gray-200 shadow-sm",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatDate(startDate) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center space-x-2 p-2 rounded-md">
                <Switch
                  id="useFiniquito"
                  checked={useFiniquito}
                  onCheckedChange={setUseFiniquito}
                />
                <Label htmlFor="useFiniquito" className="font-medium">Usar finiquito</Label>
              </div>
              
              {useFiniquito && (
                <div className="space-y-4 border-l-2 border-indigo-100 pl-4 ml-2">
                  <div className="space-y-3">
                    <Label htmlFor="finiquitoAmount" className="text-gray-700">Monto de finiquito</Label>
                    <Input
                      id="finiquitoAmount"
                      formatCurrency
                      value={finiquitoAmount}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        setFiniquitoAmount(Number(numericValue));
                      }}
                      className="border border-gray-200 shadow-sm"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="finiquitoDate" className="text-gray-700">Fecha de finiquito</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="finiquitoDate"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border border-gray-200 shadow-sm",
                            !finiquitoDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {finiquitoDate ? formatDate(finiquitoDate) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={finiquitoDate}
                          onSelect={(date) => date && setFiniquitoDate(date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-gray-700">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Agrega cualquier detalle o condición adicional..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border border-gray-200 shadow-sm min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/cotizaciones')}
              className="mr-2 border border-gray-300"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
              {submitting ? 'Creando...' : 'Crear Cotización'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaCotizacion;
