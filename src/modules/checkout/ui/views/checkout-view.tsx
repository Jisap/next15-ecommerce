"use client"

import { useTRPC } from '@/app/trpc/client';
import { trpc } from '../../../../app/trpc/server';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../hooks/use-cart';

interface CheckoutViewProps {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {

  const { productIds } = useCart(tenantSlug)
  
  const trpc = useTRPC();
  const { data } = useQuery(trpc.checkout.getProducts.queryOptions({ 
    ids: productIds
  }));
  
  return (
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  )
}

