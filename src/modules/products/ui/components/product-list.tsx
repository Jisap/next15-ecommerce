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
    <div>
      {JSON.stringify(data, null, 2)}
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

