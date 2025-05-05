"use client"

import { useTRPC } from '@/app/trpc/client';
import { trpc } from '../../../../app/trpc/server';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../hooks/use-cart';
import { useEffect } from 'react';
import { toast } from 'sonner';


interface CheckoutViewProps {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {

  const { productIds, clearAllCarts } = useCart(tenantSlug)
  
  const trpc = useTRPC();
  const { data, error } = useQuery(trpc.checkout.getProducts.queryOptions({ 
    ids: productIds
  }));

  useEffect(() => {
    if( !error ) return;
    if(error.data?.code === 'NOT_FOUND') {
      clearAllCarts();
      toast.warning("Invalid products found, cart cleared")
    }
  },[error, clearAllCarts])
  
   return (
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  )
}

