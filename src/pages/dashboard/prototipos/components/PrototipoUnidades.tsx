
import React, { useState, useCallback } from 'react';
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
  const [currentTab, setCurrentTab] = useState("todas");
  const [generarUnidadesModalOpen, setGenerarUnidadesModalOpen] = useState(false);
  const [prefijo, setPrefijo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Memoize the filtered unidades
  const disponibles = React.useMemo(() => 
    unidades.filter(u => u.estado === 'disponible'),
    [unidades]
  );
  
  const apartadas = React.useMemo(() => 
    unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso'),
    [unidades]
  );
  
  const vendidas = React.useMemo(() => 
    unidades.filter(u => u.estado === 'vendido'),
    [unidades]
  );
  
  // Determinar la cantidad total de unidades que se deben generar
  const unidadesRestantes = (prototipo.total_unidades || 0) - unidades.length;
  const noHayUnidades = unidades.length === 0;
  
  const handleGenerarUnidades = async () => {
    // Si no hay unidades restantes, no hacer nada
    if (unidadesRestantes <= 0 || isGenerating) return;
    
    setIsGenerating(true);
    try {
      await onGenerateUnidades(unidadesRestantes, prefijo);
      setGenerarUnidadesModalOpen(false);
      setPrefijo("");
    } catch (error) {
      console.error("Error al generar unidades:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handler for tab changes
  const handleTabChange = useCallback((value: string) => {
    setCurrentTab(value);
  }, []);
  
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
      
      <Tabs defaultValue="todas" value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
          <TabsTrigger value="apartadas">Apartadas</TabsTrigger>
          <TabsTrigger value="vendidas">Vendidas</TabsTrigger>
        </TabsList>
        
        {currentTab === "todas" && (
          <TabsContent value="todas" forceMount>
            <UnidadTable 
              prototipo={prototipo}
              unidades={unidades} 
              isLoading={unidadesLoading} 
              onRefresh={onRefreshUnidades}
            />
          </TabsContent>
        )}
        
        {currentTab === "disponibles" && (
          <TabsContent value="disponibles" forceMount>
            <UnidadTable 
              prototipo={prototipo}
              unidades={disponibles} 
              isLoading={unidadesLoading} 
              onRefresh={onRefreshUnidades}
            />
          </TabsContent>
        )}
        
        {currentTab === "apartadas" && (
          <TabsContent value="apartadas" forceMount>
            <UnidadTable 
              prototipo={prototipo}
              unidades={apartadas} 
              isLoading={unidadesLoading} 
              onRefresh={onRefreshUnidades}
            />
          </TabsContent>
        )}
        
        {currentTab === "vendidas" && (
          <TabsContent value="vendidas" forceMount>
            <UnidadTable 
              prototipo={prototipo}
              unidades={vendidas} 
              isLoading={unidadesLoading} 
              onRefresh={onRefreshUnidades}
            />
          </TabsContent>
        )}
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
            <Button 
              variant="outline" 
              onClick={() => setGenerarUnidadesModalOpen(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerarUnidades}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generando...' : 'Generar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrototipoUnidades;
