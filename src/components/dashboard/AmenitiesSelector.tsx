
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Amenity = {
  id: string;
  name: string;
  icon: string;
};

const AMENITIES: Amenity[] = [
  { id: "pool", name: "Alberca", icon: "🏊" },
  { id: "gym", name: "Gimnasio", icon: "💪" },
  { id: "spa", name: "Spa", icon: "💆" },
  { id: "bbq", name: "Área de BBQ", icon: "🍖" },
  { id: "playground", name: "Área infantil", icon: "🧒" },
  { id: "security", name: "Seguridad 24/7", icon: "🔒" },
  { id: "parking", name: "Estacionamiento", icon: "🚗" },
  { id: "garden", name: "Jardín", icon: "🌳" },
  { id: "beach", name: "Playa", icon: "🏖️" },
  { id: "restaurant", name: "Restaurante", icon: "🍽️" },
  { id: "bar", name: "Bar", icon: "🍹" },
  { id: "wifi", name: "WiFi", icon: "📶" }
];

interface AmenitiesSelectorProps {
  selectedAmenities: string[];
  onChange: (selectedAmenities: string[]) => void;
}

export function AmenitiesSelector({ selectedAmenities = [], onChange }: AmenitiesSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedAmenities);

  useEffect(() => {
    setSelected(selectedAmenities);
  }, [selectedAmenities]);

  const handleValueChange = (value: string[]) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <div className="w-full">
      <ToggleGroup type="multiple" value={selected} onValueChange={handleValueChange} className="flex flex-wrap gap-2">
        {AMENITIES.map((amenity) => (
          <ToggleGroupItem 
            key={amenity.id} 
            value={amenity.id}
            aria-label={amenity.name}
            className={cn(
              "flex items-center gap-2 border rounded-md px-3 py-2 hover:bg-primary/10 transition-colors",
              selected.includes(amenity.id) ? "bg-primary/20 border-primary" : "bg-background border-input"
            )}
          >
            <span className="text-lg">{amenity.icon}</span>
            <span>{amenity.name}</span>
            {selected.includes(amenity.id) && (
              <Check className="h-4 w-4 text-primary ml-1" />
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
