"use client"

import { useTRPC } from '@/app/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../../hooks/use-cart';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { generateTenantURL } from '@/lib/utils';
import { CheckoutItem } from '../components/checkout-item';
import { CheckoutSidebar } from './checkout-sidebar';
import { InboxIcon, LoaderIcon } from 'lucide-react';
import { useCheckoutStates } from '../../hooks/use-checkout-states';
import { useRouter } from 'next/navigation';


interface CheckoutViewProps {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {
  const router = useRouter();

  const [states, setStates] = useCheckoutStates();                                     // Estados de la compra según url. Despues de hacer la compra stripe nos redirige aquí con los params "?success=true/false"

  const { productIds, removeProduct, clearCart } = useCart(tenantSlug)
  
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery(trpc.checkout.getProducts.queryOptions({ // Obtenemos los productos del cart para el checkout
    ids: productIds
  }));

  const purchase = useMutation(trpc.checkout.purchase.mutationOptions({                // Mutation para realizar la compra de productos gestionada por tanstack
    
    onMutate: () => {                                                                  // Se ejecuta justo antes de que la función de mutación principal se dispare.
      setStates({ success: false, cancel: false });                                    // Se limpian los estados anteriores 
    },
    
    onSuccess: (data) => { window.location.href = data.url },                          // Si la creación de la checkout session (atraves de la mutation) es exitosa checkout devuelve data (checkout.url) -> página de pago de stripe -> stripe redirige despues a "success_url/cancel_url" expecificado en el procedimiento de checkout
    
    onError: (error) => {
      if(error.data?.code === "UNAUTHORIZED"){
        router.push("/sign-in")
      }
      toast.error(error.message)
    }
  }));

  useEffect(() => {
    if(states.success) {                                                               // Si el checkout fue exitoso, se borran los productos del cart y se redirige a la página de productos
      setStates({ success: false, cancel: false });
      clearCart();
      queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
      router.push("/library")
    }
  },[states.success, clearCart, router, setStates, queryClient, trpc.library.getMany,])

  useEffect(() => {
    if(error?.data?.code === 'NOT_FOUND') {
      clearCart();
      toast.warning("Invalid products found, cart cleared")
    }
  },[error, clearCart]);

  if(isLoading) {
    return (
      <div className='lg:pt-16 pt-4 px-4 lg:px-12'>
        <div className='border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg'>
          <LoaderIcon className="text-muted-foreground animate-spin" />
          
        </div>
      </div>
    )
  }

  if(data?.totalDocs === 0) {
    return (
      <div className='lg:pt-16 pt-4 px-4 lg:px-12'>
        <div className='border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg'>
          <InboxIcon />
          <p className='text-base font-medium'>
            No products found
          </p>
        </div>
      </div>
    )
  }
  
  
   return (
    <div className='lg:pt-16 pt-4 px-4 lg:px-12'>
       <div className='grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16'>
        <div className='lg:col-span-4'>
          <div className='border rounded-md overflow-hidden bg-white'>
            {data?.docs.map((product, index) => (
              <CheckoutItem 
                key={product.id}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantURL(product.tenant.slug)}/products/${product.id}`}
                tenantUrl={generateTenantURL(product.tenant.slug)}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id) }
              />
            ))}
          </div>
        </div>

        <div className='lg:col-span-3'>
          <CheckoutSidebar 
            total={data?.totalPrice ?? 0}
            onPurchase={() => purchase.mutate({ tenantSlug, productIds })}
            isCanceled={states.cancel}
            disabled={purchase.isPending}
          />
        </div>
       </div>
    </div>
  )
}

