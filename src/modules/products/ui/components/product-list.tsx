"use client"

import { useTRPC } from '@/app/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react'
import { Product } from '../../../../payload-types';

export const ProductList = () => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.products.getMany.queryOptions())

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

