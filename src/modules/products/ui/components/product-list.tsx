"use client"

import { useTRPC } from '@/app/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';

interface Props {
  category?: string;
}



export const ProductList = ({ category }: Props) => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.products.getMany.queryOptions({
    category // este sería el input del procedimiento -> obtendriamos el valor de los productos correspondientes a la categoría
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

