
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Building2, MoreHorizontal, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { countUnidadesByStatus } from '@/hooks/unidades/countUtils';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';

interface PrototipoHeaderProps {
  prototipo: ExtendedPrototipo;
  onDelete?: (e?: React.MouseEvent) => void;
  onEdit?: (e?: React.MouseEvent) => void;
  onBack?: (e?: React.MouseEvent) => void;
  updatePrototipoImage?: (imageUrl: string) => Promise<boolean>;
}

const PrototipoHeader = ({ prototipo, onDelete, onEdit, onBack, updatePrototipoImage }: PrototipoHeaderProps) => {
  const [unitStats, setUnitStats] = useState({
    disponibles: 0,
    vendidas: 0,
    con_anticipo: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadUnitStats = async () => {
      try {
        setIsLoading(true);
        const stats = await countUnidadesByStatus(prototipo.id);
        setUnitStats(stats);
      } catch (error) {
        console.error('Error loading unit stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUnitStats();
  }, [prototipo.id]);
  
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBack) {
      onBack(e);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEdit) {
      onEdit(e);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      onDelete(e);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center mb-1">
        {onBack ? (
          <Button variant="outline" size="sm" className="mr-4" onClick={handleBackClick} type="button">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver al desarrollo
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to={`/dashboard/desarrollos/${prototipo.desarrollo_id}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver al desarrollo
            </Link>
          </Button>
        )}
        
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" type="button">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={handleEditClick}>
                  Editar prototipo
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  className="text-red-600"
                >
                  Eliminar prototipo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:gap-8">
        <div className="space-y-1 mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold">{prototipo.nombre}</h1>
          {prototipo.desarrollo?.nombre && (
            <div className="flex items-center text-slate-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{prototipo.desarrollo.nombre}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6 ml-auto">
          <div className="text-center">
            <p className="text-slate-500 text-sm">Precio</p>
            <p className="font-bold text-lg text-indigo-600">
              ${prototipo.precio?.toLocaleString('es-MX') || '0'}
            </p>
          </div>
          
          <div className="text-center flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-slate-500 text-sm">Unidades</p>
              <p className="font-bold">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${unitStats.disponibles}/${unitStats.total} disponibles`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrototipoHeader;
