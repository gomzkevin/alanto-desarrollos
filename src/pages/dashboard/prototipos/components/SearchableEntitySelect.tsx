
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

interface EntityOption {
  id: string;
  nombre: string;
  [key: string]: any;
}

interface SearchableEntitySelectProps {
  value: string;
  onChange: (value: string, name?: string) => void;
  placeholder: string;
  options: EntityOption[];
  emptyMessage?: string;
}

export const SearchableEntitySelect = ({
  value,
  onChange,
  placeholder,
  options,
  emptyMessage = "No se encontraron resultados."
}: SearchableEntitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // More flexible filtering logic to handle accents and case insensitivity
  const normalizeString = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    const normalizedSearch = normalizeString(searchTerm);
    const normalizedName = normalizeString(option.nombre);
    return normalizedName.includes(normalizedSearch);
  });
  
  const selectedOption = options.find(option => option.id === value);
  
  // Update the search term when a value is selected externally
  useEffect(() => {
    if (selectedOption && !searchTerm) {
      setSearchTerm(selectedOption.nombre);
    }
  }, [selectedOption, searchTerm]);
  
  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">
                {selectedOption ? selectedOption.nombre : placeholder}
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
                  onSelect={() => {
                    onChange("", "");
                    setOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <span>Sin asignar</span>
                </CommandItem>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.id}
                    value={option.nombre}
                    onSelect={() => {
                      onChange(option.id, option.nombre);
                      setOpen(false);
                      setSearchTerm(option.nombre);
                    }}
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
