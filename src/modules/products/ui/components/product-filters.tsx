"use client"

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceFilter } from './price-filter';
import { useProductFilters } from '../../hooks/use-product-filters';
import { set } from 'date-fns';

interface ProductFiltersProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

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

export const ProductFilters = () => {

  const [filters, setFilters] = useProductFilters();                // Estado en url

  const onChange = (key: keyof typeof filters, value: unknown) => { // key: es una clave (nombre de propiedad) de filters (minPrice, maxPrice) y value es el nuevo valor que queremos asignar a esa clave.
    setFilters({ ...filters, [key]: value })                        // Toma el estado actual de filters (con ...filters) y reemplaza el valor de la clave especificada ([key]) con el nuevo value.
  }

  const onClear = () => {
    setFilters({ minPrice: undefined, maxPrice: undefined });
  }

  return (
    <div className="border rounded-md bg-white">
      {/* Cabecera de filtros */}
      <div className="p-4 border-b flex items-center justify-between">
        <p className="font-medium">Filters</p>
        <button 
          className="underline"
          onClick={() => onClear()}
          type="button"  
        >
          Clear
        </button>
      </div>

      {/* Filtros de productos */}
      <ProductFilter title="Price" className='border-b-0'>
        <PriceFilter 
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value) => onChange('minPrice', value)}
          onMaxPriceChange={(value) => onChange('maxPrice', value)}
        />
      </ProductFilter>
    </div>
  )
}