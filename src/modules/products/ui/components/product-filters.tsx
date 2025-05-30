"use client"

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceFilter } from './price-filter';
import { useProductFilters } from '../../hooks/use-product-filters';
import { TagsFilter } from './tags-filter';


interface ProductFiltersProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

//Componente padre
const ProductFilter = ({ title, className, children }: ProductFiltersProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div className={cn(
      "p-4 border-b flex flex-col gap-2",
      className
    )}>
      <div
        onClick={() => setIsOpen((current) => !current)}
        className='flex items-center justify-between cursor-pointer'
      >
        <p className='font-medium'>{title}</p>
        <Icon className='size-5' />
      </div>

      {isOpen && children}
    </div>
  )
}

// Componente hijo
// Modifica el estado de filters y actualiza la url
export const ProductFilters = () => {

  const [filters, setFilters] = useProductFilters();                            // Estado de filters hidratado inicialmente al cargar [category] leido desde el cliente.

  const onChange = (key: keyof typeof filters, value: unknown) => {             // key: es una clave (nombre de propiedad) de filters (minPrice, maxPrice) y value es el nuevo valor que queremos asignar a esa clave.
    setFilters({ ...filters, [key]: value })                                    // Toma el estado actual de filters (con ...filters) y reemplaza el valor de la clave especificada ([key]) con el nuevo value.
  }

  const onClear = () => {
    setFilters({ minPrice: undefined, maxPrice: undefined, tags: [] });
  }

  const hasAnyFilters = Object.entries(filters).some(([key, value]) => {        // Verifica si hay algún filtro aplicado en la url
   
    if (key === 'sort') return false;                                           // El filtro de ordenamiento (sort) no se considera un filtro que el usuario quiera "limpiar" con el botón "Clear".
   
    if(Array.isArray(value)){                                                   // Si el valor es un array
      return value.length > 0;                                                  // y no esta vacío el some() devolverá true sino false
    }

    if(typeof value === 'string'){                                              // Si el valor es una cadena de texto
      return value !== '';                                                      // devuelve true si la cadena no esta vacía
    }
    return value !== null;                                                      // Si el valor no es una cadena devuelve true si es diferente de null
  });
  

  return (
    <div className="border rounded-md bg-white">
      {/* Cabecera de filtros */}
      <div className="p-4 border-b flex items-center justify-between">
        <p className="font-medium">Filters</p>
        {hasAnyFilters && (
          <button 
            className="underline cursor-pointer"
            onClick={() => onClear()}
            type="button"  
          >
            Clear
          </button>
        )}
      </div>

      {/* Filtros de productos */}
      <ProductFilter title="Price" className=''>
        <PriceFilter 
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value) => onChange('minPrice', value)}
          onMaxPriceChange={(value) => onChange('maxPrice', value)}
        />
      </ProductFilter>

      <ProductFilter title="Tags" className='border-b-0'>
        <TagsFilter 
          value={filters.tags} // array de tags
          onChange={(value) => onChange('tags', value)}
        />
      </ProductFilter>
    </div>
  )
}