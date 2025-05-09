import { getQueryClient, trpc } from '@/app/trpc/server';
import ProductView from '@/modules/library/ui/views/product-view';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

interface Props {
  params: Promise<{
    productId: string
  }>
}

const Page = async({ params }: Props) => {

  const { productId } = await params

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.library.getOne.queryOptions({  // Prefetch de productos desde library.getOne
    productId
  }));

  void queryClient.prefetchQuery(trpc.reviews.getOne.queryOptions({  // Prefetch de reviews desde reviews.getOne
    productId 
  })); 

  return (
    // HydrationBoundary transfiere el estado precargado del servidor al cliente
    <HydrationBoundary state={dehydrate(queryClient)}> 
      <ProductView productId={productId} />
    </HydrationBoundary>
  )
}

export default Page