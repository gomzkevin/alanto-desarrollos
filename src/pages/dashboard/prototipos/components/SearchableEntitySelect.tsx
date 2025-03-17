
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  label: string;
  value: string;
  onChange: (value: string, name?: string) => void;
  placeholder: string;
  options: EntityOption[];
  emptyMessage?: string;
}

export const SearchableEntitySelect = ({
  label,
  value,
  onChange,
  placeholder,
  options,
  emptyMessage = "No se encontraron resultados."
}: SearchableEntitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredOptions = options.filter(option => 
    option.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedOption = options.find(option => option.id === value);
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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
                  }}
                >
                  <span>Sin asignar</span>
                </CommandItem>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={() => {
                      onChange(option.id, option.nombre);
                      setOpen(false);
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
