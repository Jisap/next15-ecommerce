"use client"

import { useTRPC } from '@/app/trpc/client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useProductFilters } from '../../hooks/use-product-filters';
import { ProductCard, ProductCardSkeleton } from './product-card';
import { DEFAULT_LIMIT } from '@/constants';
import { Button } from '@/components/ui/button';
import { InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  category?: string;
  tenantSlug?: string;
  narrowView?: boolean;
}


// Muestra una lista de productos filtrados por categoría y filtros aplicados en url
export const ProductList = ({ category, tenantSlug, narrowView }: Props) => {

  const [filters] = useProductFilters();                // Estado de filters hidratado inicialmente al cargar [category] leido desde el cliente.
                                                        // Cualquier cambio en los filtros actualizará la url y este hook devolverá los nuevos valores

  const trpc = useTRPC();                               // Instancia del cliente trpc para realizar llamadas a la api 

  const { 
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useSuspenseInfiniteQuery(                         // useSuspenseQuery detecta cambios en filters -> nueva petición a trpc -> actualiza page sin recargarla                   
    trpc.products.getMany.infiniteQueryOptions({        // Llamada al procedimiento products.getMany para obtener los productos pasandole la categoría y los filtros aplicados en url
      category,                                         // este sería el input del procedimiento -> obtendriamos el valor de los productos correspondientes a la categoría
      ...filters,                                       // filtros aplicados en url
      tenantSlug,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
      }
    }
  ));

  if(data.pages?.[0]?.docs.length === 0) {
    return (
      <div className='border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg'>
        <InboxIcon />
        <p className='text-base font-medium'>
          No products found
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
        narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"  
      )}>
        {data?.pages.flatMap((page) => page.docs).map((product) => (
          <ProductCard 
            key={product.id}
            id={product.id}
            name={product.name}
            imageUrl={product.image?.url}
            tenantSlug={product.tenant?.slug}
            tenantImageUrl={product.tenant?.image?.url}
            reviewRating={3}
            reviewCount={5}
            price={product.price}
          />
        ))}
      </div>

      <div className='flex justify-center pt-8'>
        {hasNextPage && (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className='font-medium disabled:opacity-50 text-base bg-white'
            variant="elevated"
          >
            Load More
          </Button>
        )}
      </div>
    </>
  )
}

export const ProductListSkeleton = ({ narrowView }: Props) => {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
      narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
    )}>
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

