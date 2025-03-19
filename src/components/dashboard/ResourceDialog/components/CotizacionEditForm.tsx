
import React, { useState, useEffect } from 'react';
import { DialogHeader } from './DialogHeader';
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CalendarIcon, Search } from "lucide-react";
import { useForm } from 'react-hook-form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from '@/lib/utils';

interface CotizacionEditFormProps {
  cotizacion: any;
  onSave: (values: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function CotizacionEditForm({ cotizacion, onSave, onCancel, isLoading }: CotizacionEditFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isExistingClient, setIsExistingClient] = useState(true);
  const [searchLeadTerm, setSearchLeadTerm] = useState<string>('');
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [showLeadsDropdown, setShowLeadsDropdown] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    cotizacion.fecha_inicio_pagos ? parseISO(cotizacion.fecha_inicio_pagos) : new Date()
  );
  
  const [finiquitoDate, setFiniquitoDate] = useState<Date | undefined>(
    cotizacion.fecha_finiquito ? parseISO(cotizacion.fecha_finiquito) : undefined
  );

  const { leads } = useLeads({ limit: 100 });
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ 
    desarrolloId: cotizacion.desarrollo_id 
  });

  // Update the form with additional fields for new client
  const form = useForm({
    defaultValues: {
      isExistingClient: true,
      leadId: cotizacion.lead_id,
      desarrollo_id: cotizacion.desarrollo_id,
      prototipo_id: cotizacion.prototipo_id,
      monto_anticipo: cotizacion.monto_anticipo,
      numero_pagos: cotizacion.numero_pagos,
      usar_finiquito: cotizacion.usar_finiquito,
      monto_finiquito: cotizacion.monto_finiquito || 0,
      notas: cotizacion.notas || '',
      // Add fields for new client
      nombre: '',
      email: '',
      telefono: ''
    }
  });

  // Initialize the selectedLead from the cotizacion data
  useEffect(() => {
    if (cotizacion.lead && cotizacion.lead.id) {
      setSelectedLead(cotizacion.lead);
      setSearchLeadTerm(cotizacion.lead.nombre || '');
    }
  }, [cotizacion]);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "PPP", { locale: es });
  };

  const handleSelectLead = (lead: any) => {
    setSelectedLead(lead);
    form.setValue('leadId', lead.id);
    setShowLeadsDropdown(false);
    setSearchLeadTerm(lead.nombre);
  };

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      fecha_inicio_pagos: startDate ? startDate.toISOString() : null,
      fecha_finiquito: values.usar_finiquito && finiquitoDate ? finiquitoDate.toISOString() : null
    };
    
    onSave(formattedValues);
  };

  if (isLoading) {
    return (
      <div className="w-full py-10">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <DialogHeader
        title="Editar Cotización"
        description="Editar la información de la cotización"
      />
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 border-b">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="general" 
              className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="financiamiento" 
              className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
            >
              Financiamiento
            </TabsTrigger>
            <TabsTrigger 
              value="adicional" 
              className="py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
            >
              Adicional
            </TabsTrigger>
          </TabsList>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <TabsContent value="general" className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cliente</h3>
                
                <div className="flex items-center space-x-4 py-2">
                  <FormLabel htmlFor="isExistingClient" className="flex-1">Cliente existente</FormLabel>
                  <Switch 
                    id="isExistingClient" 
                    checked={isExistingClient}
                    onCheckedChange={setIsExistingClient}
                  />
                </div>
                
                {isExistingClient ? (
                  <div className="relative">
                    <FormLabel htmlFor="searchLead">Buscar cliente</FormLabel>
                    <div className="relative">
                      <Input
                        id="searchLead"
                        placeholder="Buscar por nombre, email o teléfono"
                        value={searchLeadTerm}
                        onChange={(e) => {
                          setSearchLeadTerm(e.target.value);
                          setShowLeadsDropdown(true);
                          
                          // Filter leads based on search term
                          if (e.target.value.trim() !== '') {
                            const filtered = leads.filter(lead => 
                              lead.nombre.toLowerCase().includes(e.target.value.toLowerCase()) ||
                              (lead.email && lead.email.toLowerCase().includes(e.target.value.toLowerCase())) ||
                              (lead.telefono && lead.telefono.toLowerCase().includes(e.target.value.toLowerCase()))
                            );
                            setFilteredLeads(filtered);
                          } else {
                            setFilteredLeads([]);
                          }
                        }}
                        className="w-full pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    
                    {showLeadsDropdown && filteredLeads.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                        {filteredLeads.map((lead) => (
                          <div 
                            key={lead.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectLead(lead)}
                          >
                            <div className="font-medium">{lead.nombre}</div>
                            <div className="text-sm text-gray-500">
                              {lead.email || lead.telefono || "Sin datos de contacto"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedLead && (
                      <div className="mt-2 p-2 border rounded-md bg-gray-50">
                        <div className="font-medium">{selectedLead.nombre}</div>
                        <div className="text-sm">
                          {selectedLead.email && <div>Email: {selectedLead.email}</div>}
                          {selectedLead.telefono && <div>Teléfono: {selectedLead.telefono}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del cliente</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre completo" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="correo@ejemplo.com" type="email" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+52 55 1234 5678" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-medium mt-6">Propiedad</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="desarrollo_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desarrollo</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar desarrollo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {desarrollos.map((desarrollo) => (
                              <SelectItem key={desarrollo.id} value={desarrollo.id}>
                                {desarrollo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prototipo_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prototipo</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prototipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {prototipos.map((proto) => (
                              <SelectItem key={proto.id} value={proto.id}>
                                {proto.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="financiamiento" className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detalles de pago</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monto_anticipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto de anticipo</FormLabel>
                        <FormControl>
                          <Input 
                            formatCurrency 
                            value={field.value}
                            onChange={(e) => {
                              // Remove non-numeric characters for the actual value
                              const numericValue = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(parseFloat(numericValue) || 0);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="numero_pagos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de pagos</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormItem>
                    <FormLabel>Fecha de inicio de pagos</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                          type="button"
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="usar_finiquito"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Usar finiquito</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('usar_finiquito') && (
                  <div className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="monto_finiquito"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto de finiquito</FormLabel>
                          <FormControl>
                            <Input 
                              formatCurrency 
                              value={field.value}
                              onChange={(e) => {
                                // Remove non-numeric characters for the actual value
                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(parseFloat(numericValue) || 0);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormItem>
                      <FormLabel>Fecha de finiquito</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !finiquitoDate && "text-muted-foreground"
                            )}
                            type="button"
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="adicional" className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información adicional</h3>
                
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <div className="px-6 py-4 border-t flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={
                  (!isExistingClient && !form.watch('nombre')) || 
                  (isExistingClient && !selectedLead) ||
                  !form.watch('desarrollo_id') ||
                  !form.watch('prototipo_id')
                }
              >
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </>
  );
}
