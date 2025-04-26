import { getQueryClient, trpc } from "@/app/trpc/server";
import { ProductList, ProductListSkeleton } from "@/modules/products/ui/components/product-list";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";



interface Props {
  params: Promise<{
    category: string
  }>
}

const Page = async({}: Props) => {

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.products.getMany.queryOptions());
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </HydrationBoundary>
    
  )
}

export default Page