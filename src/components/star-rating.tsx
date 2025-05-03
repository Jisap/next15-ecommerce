"use client"

import { cn } from "@/lib/utils"
import { StarIcon } from "lucide-react"

const MAX_RATING = 5;
const MIN_RATING = 0;

interface StarRatingProps {
  rating: number;
  className?: string;
  iconClassName?: string;
  text?: string;
}


export const StarRating = ({ rating, className, iconClassName, text }: StarRatingProps) => {
  
  const safeRating = Math.max(MIN_RATING, Math.min(rating, MAX_RATING)); // "acota" (clamp) el valor de rating para que siempre esté entre 0 y 5,
  
  return (
    <div className={cn("flex items-center gap-x-1", className)}>
      {Array.from({ length: MAX_RATING }).map((_, index) => ( // Generamos un array de elementos con el tamaño del array MAX_RATING
        <StarIcon 
          key={index}
          className={cn(
            "size-4",
            index < safeRating ? "fill-black" : "", // Si el índice es menor que el valor de la calificación, se aplica la clase "fill-black" para mostrar el ícono de estrella en color negro
            iconClassName,
          )}
        />
      ))}
      {text && <p>{text}</p>}
    </div>
  )
}
