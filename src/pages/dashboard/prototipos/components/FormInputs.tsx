
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Text Input with Label
export const FormField = ({ 
  label, 
  id, 
  error, 
  ...props 
}: { 
  label: string; 
  id: string; 
  error?: boolean; 
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className={error ? 'border-red-500' : ''}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">Este campo es requerido</p>
      )}
    </div>
  );
};

// Estado Select Field
export const EstadoSelect = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="estado">Estado *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="disponible">Disponible</SelectItem>
          <SelectItem value="apartado">Apartado</SelectItem>
          <SelectItem value="en_proceso">En Proceso</SelectItem>
          <SelectItem value="vendido">Vendido</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// Date Picker
export const DatePickerField = ({
  label,
  date,
  onSelect
}: {
  label: string;
  date?: Date;
  onSelect: (date: Date | undefined) => void;
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP', { locale: es }) : "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Entity Select
export const EntitySelect = ({
  label,
  value,
  onChange,
  placeholder,
  options,
  emptyOption = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { id: string; nombre: string }[];
  emptyOption?: boolean;
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {emptyOption && <SelectItem value="">Sin asignar</SelectItem>}
          {options.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Form Actions
export const FormActions = ({
  onCancel,
  isEdit
}: {
  onCancel: () => void;
  isEdit: boolean;
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEdit ? 'Guardar Cambios' : 'Crear Unidad'}
      </Button>
    </div>
  );
};
