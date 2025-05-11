"use client"

//TODO: Add real ratings

import { useTRPC } from '@/app/trpc/client';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, generateTenantURL } from '@/lib/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LinkIcon, StarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
//import { CartButton } from '../ui/components/cart-button';
import dynamic from 'next/dynamic';

// Se usa dynamic con ssr: false para componentes que dependen de estado o APIs exclusivas del navegador 
// (como localStorage a través de useCart) durante su renderizado inicial. Esto evita que el servidor intente 
// adivinar un estado que no conoce, previniendo así las discrepancias con el renderizado inicial del cliente 
// y los consecuentes errores de hidratación.

const CartButton = dynamic(() => import('../ui/components/cart-button').then(  // Solo después de que la carga inicial y la hidratación principal han ocurrido, el CartButton se monta y renderiza por primera vez, ya directamente en el entorno del cliente.
  (mod) => mod.CartButton                                                      // En este punto, useCart puede acceder a localStorage sin problemas y el botón se renderiza con el estado correcto desde el principio (en el cliente),
), { 
  ssr: false,                                                                  // ssr: false no renderiza el componente en el server-side
  loading: () => <Button disabled className='flex-1 bg-pink-400'>Add to cart</Button>,                                     
  }
);                                                            


interface ProductViewProps {
  productId: string;
  tenantSlug: string;
}

export const ProductView = ({ productId, tenantSlug }: ProductViewProps) => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({ id: productId }));

  return (
    <div className='px-4 lg:px-12 py-10'>
      <div className='border rounded-sm bg-white overflow-hidden'>
        {/* Imagen del producto */}
        <div className='relative aspect-[3.9] border-b'>
          <Image
            src={data.image?.url || "/placeholder.png"}
            alt={data.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Información del producto */}
        <div className='grid grid-cols-1 lg:grid-cols-6'>
          {/* Left col-span-4*/}
          <div className='col-span-4'>
            {/* Name */}
            <div className='p-6'>
              <h1 className='text-4xl font-medium'>
                {data.name}
              </h1>
            </div>

            {/* Price - tenant - rating */}
            <div className='border-y flex'>
              <div className='px-6 py-4 flex items-center justify-center border-r'>
                <div className='relative px-2 py-1 border bg-pink-400 w-fit'>
                  <p className='text-base font-medium'>
                    {formatCurrency(data.price)}
                  </p>
                </div>
              </div>

              <div className='px-6 py-4 flex items-center justify-center lg:border-r'>
                <Link
                  href={generateTenantURL(tenantSlug)}
                  className='flex items-center gap-2'
                >
                  {data.tenant.image?.url && (
                    <Image
                      src={data.tenant.image.url}
                      alt={data.tenant.name}
                      width={20}
                      height={20}
                      className="rounded-full border shrink-0 size-[20px]"
                    />
                  )}
                  <p className='text-base underline font-medium'>
                    {data.tenant.name}
                  </p>
                </Link>
              </div>

              <div className='hidden lg:flex px-6 py-4 items-center justify-center'>
                <div className='flex items-center gap-2'>
                  <StarRating
                    rating={data.reviewRating}
                    iconClassName='size-4'
                  />
                  <p className='text-xs font-medium'>
                    {data.reviewCount} ratings
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mobile rating */}
            <div className='block lg:hidden px-6 py-4 items-center justify-center border-b'>
              <div className='flex items-center gap-1'>
                <StarRating
                  rating={data.reviewRating}
                  iconClassName='size-4'
                />
                <p className='text-xs font-medium'>
                  {data.reviewCount} ratings
                </p>
              </div>
            </div>

            {/* description */}
            <div className='p-6'>
              {data.description ? (
                <p>{data.description}</p>
              ) : (
                <p className='font-medium text-muted-foreground italic'>
                  No description provided
                </p>
              )}
            </div>
          </div>

          {/* Right col-span-2 */}
          <div className='col-span-2'>
            <div className='border-t lg:border-t-0 lg:border-l h-full'>
              <div className='flex flex-col gap-4 p-6 border-b'>
                <div className='flex flex-row items-center gap-2'>
                  {/* btn add to cart / btn view in library */}
                  <CartButton
                    isPurchased={data.isPurchased}
                    tenantSlug={tenantSlug}
                    productId={productId}
                  />
                  
                  {/* btn link to library */}
                  <Button
                    className='size-12'
                    variant="elevated"
                    onClick={() => { }}
                    disabled={false}
                  >
                    <LinkIcon />
                  </Button>
                </div>

                <p className='text-center font-medium'>
                  {data.refundPolicy === "no-refund"
                    ? "No refund"
                    : `${data.refundPolicy} money back guarantee`
                  }
                </p>
              </div>

              <div className='p-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl font-medium'>
                    Ratings
                  </h3>
                  <div className='flex items-center gap-x-1 font-medium'>
                    <StarIcon className="size-4 fill-black" />
                    <p>({5})</p>
                    <p className='text-base'>{5} ratings</p>
                  </div>
                </div>

                <div className='grid grid-cols-[auto_1fr_auto] gap-3 mt-4'>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <Fragment key={stars}>
                      <div className='font-medium'>
                        {stars} {stars === 1 ? "star" : "stars"}
                      </div>
                      <Progress 
                        value={0}
                        className='h-[1lh]'
                      />
                      <div className='font-medium'>
                        {0}%
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

