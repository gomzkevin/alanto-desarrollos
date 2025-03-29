
import React, { useState, useEffect } from 'react';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface EntityOption {
  id: string;
  nombre: string;
  [key: string]: any;
}

export interface SearchableEntitySelectProps {
  value: string;
  onChange?: (value: string, name?: string) => void;
  onSelect?: (entity: any) => void;
  placeholder?: string;
  options?: EntityOption[];
  entities?: EntityOption[];
  label?: string; // Add label prop
  emptyMessage?: string;
  displayValue?: string;
  disabled?: boolean;
}

export const SearchableEntitySelect = ({
  value,
  onChange,
  onSelect,
  placeholder = "Seleccionar...",
  options = [],
  entities = [],
  label,
  emptyMessage = "No se encontraron resultados.",
  displayValue = "",
  disabled = false
}: SearchableEntitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use either options or entities (for backward compatibility)
  const entityOptions = options.length > 0 ? options : entities;
  
  // More flexible filtering logic to handle accents and case insensitivity
  const normalizeString = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const filteredOptions = entityOptions.filter(option => {
    if (!searchTerm) return true;
    const normalizedSearch = normalizeString(searchTerm);
    const normalizedName = normalizeString(option.nombre);
    return normalizedName.includes(normalizedSearch);
  });
  
  const selectedOption = entityOptions.find(option => option.id === value);
  
  // Update the search term when a value is selected externally
  useEffect(() => {
    if (selectedOption && !searchTerm) {
      setSearchTerm("");
    }
  }, [selectedOption, searchTerm]);

  const handleSelect = (entityId: string, entityName: string) => {
    if (onChange) {
      onChange(entityId, entityName);
    }
    
    if (onSelect) {
      const selectedEntity = entityOptions.find(entity => entity.id === entityId);
      onSelect(selectedEntity || null);
    }
    
    setSearchTerm("");
    setOpen(false);
  };
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => setOpen(!open)}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">
                {displayValue || (selectedOption ? selectedOption.nombre : placeholder)}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="empty-option"
                  value=""
                  onSelect={() => handleSelect("", "")}
                >
                  <span>Sin asignar</span>
                </CommandItem>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.id}
                    value={option.nombre}
                    onSelect={() => handleSelect(option.id, option.nombre)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchableEntitySelect;
