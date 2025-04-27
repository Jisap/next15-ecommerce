

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent } from "react";


interface Props {
  minPrice?: string | null;
  maxPrice?: string | null;
  onMinPriceChange?: (value: string) => void;
  onMaxPriceChange?: (value: string) => void;
}

export const formatAsCurrency = (value: string) => {                            // La función recibe un parámetro value de tipo string. 
  const numericValue = value.replace(/[^0-9.]/g, '');                           // Elimina todos los caracteres que no sean números o puntos decimales
  const parts = numericValue.split('.');                                        // Divide el valor en parte entera y decimal
  const formattedValue =                                                        // Formatea el valor manteniendo solo hasta 2 decimales
    parts[0] + (parts.length > 1 ? '.' + parts[1]?.slice(0, 2) : '');            

  if (!formattedValue) return '';                                               
   
  const numberValue = parseFloat(formattedValue);                               // Convierte a número de punto flotante
  if(isNaN(numberValue)) return '';

  return new Intl.NumberFormat('en-US', {                                       // Formatea el número como moneda USD utilizando Intl.NumberFormat
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0, // Elimina los ceros decimales
    maximumFractionDigits: 2, // Muestra solo dos decimales
  }).format(numberValue);
}


export const PriceFilter = ({ 
  minPrice, 
  maxPrice, 
  onMinPriceChange, 
  onMaxPriceChange }: Props
) => {

  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9.]/g, ''); // Extrae solo números y puntos decimales
    onMinPriceChange?.(numericValue);
  }

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9.]/g, '');
    onMaxPriceChange?.(numericValue);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">
          Minimum price
        </Label>

        <Input 
          type="text"
          placeholder="$0"
          value={minPrice ? formatAsCurrency(minPrice) : ''}
          onChange={handleMinPriceChange} // onChange -> handleMinPriceChange -> numericValue -> onMinPriceChange -> actualiza estado de minPrice -> actualiza url
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">
          Maximum price
        </Label>

        <Input
          type="text"
          placeholder="∞"
          value={maxPrice ? formatAsCurrency(maxPrice) : ''}
          onChange={handleMaxPriceChange}
        />
      </div>
    </div>
  )
}