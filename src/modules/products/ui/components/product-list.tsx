"use client"

import { useTRPC } from '@/app/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useProductFilters } from '../../hooks/use-product-filters';

interface Props {
  category?: string;
}


// Muestra una lista de productos filtrados por categoría y filtros aplicados en url
export const ProductList = ({ category }: Props) => {

  const [filters] = useProductFilters();                // Estado de filters hidratado inicialmente al cargar [category] leido desde el cliente.
                                                        // Cualquier cambio en los filtros actualizará la url y este hook devolverá los nuevos valores

  const trpc = useTRPC();                               // Instancia del cliente trpc para realizar llamadas a la api 

  const { data } = useSuspenseQuery(                    // useSuspenseQuery detecta cambios en filters -> nueva petición a trpc -> actualiza page sin recargarla                   
    trpc.products.getMany.queryOptions({                // Llamada al procedimiento products.getMany para obtener los productos pasandole 
      category,                                         // este sería el input del procedimiento -> obtendriamos el valor de los productos correspondientes a la categoría
      ...filters                                        // filtros aplicados en url
  }))

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
      {data?.docs.map((product) => (
        <div key={product.id} className='border rounded-md bg-white'>
          <h2 className='text-xl font-medium p-4'>
            {product.name}
          </h2>
          <p>
            {product.price}
          </p>
        </div>
      ))}
    </div>
  )
}

export const ProductListSkeleton = () => {
  return (
    <div>
      Loading...
    </div>
  )
}

