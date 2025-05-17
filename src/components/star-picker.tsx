"use client"

import { cn } from "@/lib/utils"
import { StarIcon } from "lucide-react"
import { useState } from "react"

interface StarPickerProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}


export const StarPicker = ({ 
  value = 0,                            // valor del campo del formulario rating
  onChange,                             // Recoge el valor de cambio del campo rating
  disabled,                             // Si el producto tiene reviews disabled=true
  className 
}: StarPickerProps) => {

  const [hoverValue, setHoverValue] = useState(0);

  const handleChange = (value: number) => {
    onChange?.(value); 
  }

  return (
    <div
      className={cn(
        "flex items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={cn(
            "p-0.5 hover:scale-110 transition",
            !disabled && "cursor-pointer"
          )}
          onClick={() => handleChange(star)}         // Cuando se hace click en una estrella se llama a handleChange con el valor del star -> onChange -> nuevo valor del campo del formulario rating
          onMouseEnter={() => setHoverValue(star)}   // Cuando se pasa el ratón por encima de una estrella hoverValue se actualiza con el valor del star
          onMouseLeave={() => setHoverValue(0)}
        >
          <StarIcon 
            className={cn(
              "size-5",
              (hoverValue || value) >= star          // Rellena la estrella si su valor es menor o igual al valor actual (hover o seleccionado)
                ? "fill-black stroke-black"      // Estrella rellena
                : "stroke-black"                   // Estrella solo con border 
            )}
          />
        </button>
      ))}
    </div>
  )
}

