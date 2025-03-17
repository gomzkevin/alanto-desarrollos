
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnidadTable } from '../UnidadTable';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';

interface PrototipoUnidadesProps {
  prototipo: ExtendedPrototipo;
  unidades: any[];
  unidadesLoading: boolean;
  unitCounts: {
    disponibles: number;
    vendidas: number;
    con_anticipo: number;
  };
  onAddUnidad: () => void;
  onGenerateUnidades: (cantidad: number, prefijo: string) => Promise<void>;
  onRefreshUnidades: () => void;
}

export const PrototipoUnidades = ({ 
  prototipo, 
  unidades, 
  unidadesLoading, 
  unitCounts,
  onAddUnidad, 
  onGenerateUnidades,
  onRefreshUnidades 
}: PrototipoUnidadesProps) => {
  const [generarUnidadesModalOpen, setGenerarUnidadesModalOpen] = useState(false);
  const [cantidadUnidades, setCantidadUnidades] = useState(1);
  const [prefijo, setPrefijo] = useState("");
  
  const handleGenerarUnidades = async () => {
    if (cantidadUnidades <= 0) return;
    
    await onGenerateUnidades(cantidadUnidades, prefijo);
    setGenerarUnidadesModalOpen(false);
    setCantidadUnidades(1);
    setPrefijo("");
  };
  
  return (
    <div className="bg-slate-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-5 w-5" />
            Unidades
          </h2>
          <p className="text-slate-600">
            {unidades.length} de {prototipo.total_unidades} unidades registradas 
            ({unitCounts.disponibles} disponibles, 
            {unitCounts.vendidas} vendidas, 
            {unitCounts.con_anticipo} con anticipo)
          </p>
        </div>
        
        <div className="flex space-x-2">
          {unidades.length < prototipo.total_unidades && (
            <Button onClick={() => setGenerarUnidadesModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Generar unidades
            </Button>
          )}
          
          <Button onClick={onAddUnidad}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar unidad
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="todas">
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
          <TabsTrigger value="apartadas">Apartadas</TabsTrigger>
          <TabsTrigger value="vendidas">Vendidas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todas">
          <UnidadTable 
            prototipo={prototipo}
            unidades={unidades} 
            isLoading={unidadesLoading} 
            onRefresh={onRefreshUnidades}
          />
        </TabsContent>
        
        <TabsContent value="disponibles">
          <UnidadTable 
            prototipo={prototipo}
            unidades={unidades.filter(u => u.estado === 'disponible')} 
            isLoading={unidadesLoading} 
            onRefresh={onRefreshUnidades}
          />
        </TabsContent>
        
        <TabsContent value="apartadas">
          <UnidadTable 
            prototipo={prototipo}
            unidades={unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso')} 
            isLoading={unidadesLoading} 
            onRefresh={onRefreshUnidades}
          />
        </TabsContent>
        
        <TabsContent value="vendidas">
          <UnidadTable 
            prototipo={prototipo}
            unidades={unidades.filter(u => u.estado === 'vendido')} 
            isLoading={unidadesLoading} 
            onRefresh={onRefreshUnidades}
          />
        </TabsContent>
      </Tabs>
      
      <Dialog open={generarUnidadesModalOpen} onOpenChange={setGenerarUnidadesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar unidades</DialogTitle>
            <DialogDescription>
              Crea múltiples unidades para este prototipo de forma automática.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad de unidades</Label>
              <Input 
                id="cantidad" 
                type="number" 
                min="1" 
                max={prototipo.total_unidades - unidades.length}
                value={cantidadUnidades} 
                onChange={(e) => setCantidadUnidades(parseInt(e.target.value) || 1)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prefijo">Prefijo (opcional)</Label>
              <Input 
                id="prefijo" 
                value={prefijo} 
                onChange={(e) => setPrefijo(e.target.value)} 
                placeholder="Ej: 'Unidad-' resultará en Unidad-1, Unidad-2, etc."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerarUnidadesModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleGenerarUnidades}>Generar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrototipoUnidades;
