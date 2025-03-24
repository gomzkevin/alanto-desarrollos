
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit } from "lucide-react";
import { ExtendedPrototipo } from "@/hooks/usePrototipos";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "@/components/dashboard/ImageUploader";

interface PrototipoHeaderProps {
  prototipo: ExtendedPrototipo;
  onBack: () => void;
  onEdit: () => void;
  updatePrototipoImage: (imageUrl: string) => Promise<boolean>;
  canEdit?: boolean;
}

const PrototipoHeader = ({ prototipo, onBack, onEdit, updatePrototipoImage, canEdit = false }: PrototipoHeaderProps) => {
  const handleImageUploaded = async (imageUrl: string) => {
    console.log("Image uploaded in PrototipoHeader:", imageUrl);
    const success = await updatePrototipoImage(imageUrl);
    
    if (!success) {
      console.error("Failed to update prototipo image in database");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>
        
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/3 lg:w-1/4">
          <ImageUploader 
            entityId={prototipo.id}
            bucketName="prototipo-images"
            folderPath="prototipos"
            currentImageUrl={prototipo.imagen_url}
            onImageUploaded={handleImageUploaded}
            disabled={!canEdit}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{prototipo.nombre}</h1>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {prototipo.tipo || 'Sin tipo'}
              </Badge>
              {prototipo.desarrollo?.nombre && (
                <Badge variant="secondary" className="text-xs">
                  {prototipo.desarrollo.nombre}
                </Badge>
              )}
            </div>
            
            <p className="text-xl font-medium mt-2">
              {new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: prototipo.desarrollo?.moneda || 'MXN',
                maximumFractionDigits: 0
              }).format(prototipo.precio || 0)}
            </p>
            
            {prototipo.descripcion && (
              <p className="text-muted-foreground mt-2">{prototipo.descripcion}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrototipoHeader;
