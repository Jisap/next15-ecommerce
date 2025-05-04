"use client"


import { useTRPC } from '@/app/trpc/client';
import { Button } from '@/components/ui/button';
import { generateTenantURL } from '@/lib/utils';
//import { CheckoutButton } from '@/modules/checkout/ui/components/checkout-button';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import dynamic from 'next/dynamic';

import Image from 'next/image';
import Link from 'next/link';

const CheckoutButton = dynamic(() => import('@/modules/checkout/ui/components/checkout-button').then(  // Solo después de que la carga inicial y la hidratación principal han ocurrido, el CartButton se monta y renderiza por primera vez, ya directamente en el entorno del cliente.
  (mod) => mod.CheckoutButton                                                                       // En este punto, useCart puede acceder a localStorage sin problemas y el botón se renderiza con el estado correcto desde el principio (en el cliente),
), {
  ssr: false,                                                                                       // ssr: false no renderiza el componente en el server-side
  loading: () => (
    <Button 
      disabled 
      className='bg-white'
    >
      <ShoppingCart className='text-black' />
    </Button>),
}
); 

interface Props {
  slug: string;
}

export const Navbar = ({ slug }: Props ) => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <nav className='h-20 border-b font-medium bg-white'>
      <div className='max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12'>
        <Link href={generateTenantURL(slug)} className="flex items-center gap-2">
          {data.image?.url && (
            <Image 
              src={data.image.url}
              width={32}
              height={32}
              alt={slug}
              className="rounded-full border shrink-0 size-[32px]"
            />
          )}
          <p className='text-xl'>{data.name}</p>
        </Link>

        <CheckoutButton 
          tenantSlug={slug}
        />
      </div>
    </nav>
  );
};

export const NavbarSkeleton = () => {
  return (
    <nav className='h-20 border-b font-medium bg-white'>
      <div className='max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12'>
        <div />
        {/* TODO: skeleton for checkout button */}
      </div>
    </nav>
  )
}

