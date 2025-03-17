
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnidadTable } from '../UnidadTable';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import UnidadTableActions from './UnidadTableActions';

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
  const [prefijo, setPrefijo] = useState("");
  
  // Determinar la cantidad total de unidades que se deben generar
  const unidadesRestantes = (prototipo.total_unidades || 0) - unidades.length;
  const noHayUnidades = unidades.length === 0;
  
  const handleGenerarUnidades = async () => {
    // Si no hay unidades restantes, no hacer nada
    if (unidadesRestantes <= 0) return;
    
    await onGenerateUnidades(unidadesRestantes, prefijo);
    setGenerarUnidadesModalOpen(false);
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
        
        <UnidadTableActions
          onAddClick={onAddUnidad}
          onGenerateClick={() => setGenerarUnidadesModalOpen(true)}
          unidadesCount={unidades.length}
          totalUnidades={prototipo.total_unidades || 0}
          showGenerateButton={true}
        />
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
                value={unidadesRestantes}
                readOnly
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-muted-foreground">
                Este valor está predefinido según el total de unidades del prototipo.
              </p>
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
