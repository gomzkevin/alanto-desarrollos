
import React, { useState, useMemo } from 'react';
import { Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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

export const PrototipoUnidades = React.memo(({ 
  prototipo, 
  unidades = [], 
  unidadesLoading = false, 
  unitCounts,
  onAddUnidad, 
  onGenerateUnidades,
  onRefreshUnidades 
}: PrototipoUnidadesProps) => {
  const [currentTab, setCurrentTab] = useState("todas");
  const [generarUnidadesModalOpen, setGenerarUnidadesModalOpen] = useState(false);
  const [prefijo, setPrefijo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Memoize filtered units to prevent unnecessary re-renders
  const filteredUnidades = useMemo(() => {
    if (currentTab === "todas") return unidades;
    if (currentTab === "disponibles") return unidades.filter(u => u.estado === 'disponible');
    if (currentTab === "apartadas") return unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso');
    if (currentTab === "vendidas") return unidades.filter(u => u.estado === 'vendido');
    return unidades;
  }, [unidades, currentTab]);
  
  // Determine remaining units
  const unidadesRestantes = (prototipo.total_unidades || 0) - unidades.length;
  
  const handleGenerarUnidades = async () => {
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
      
      <Tabs defaultValue="todas" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
          <TabsTrigger value="apartadas">Apartadas</TabsTrigger>
          <TabsTrigger value="vendidas">Vendidas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab} forceMount>
          {unidadesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3 text-lg text-slate-600">Cargando unidades...</span>
            </div>
          ) : (
            <UnidadTable 
              prototipo={prototipo}
              unidades={filteredUnidades} 
              isLoading={false} 
              onRefresh={onRefreshUnidades}
            />
          )}
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
});

PrototipoUnidades.displayName = 'PrototipoUnidades';

export default PrototipoUnidades;
