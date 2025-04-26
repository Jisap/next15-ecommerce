import { getQueryClient, trpc } from "@/app/trpc/server";
import { ProductList, ProductListSkeleton } from "@/modules/products/ui/components/product-list";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";


interface Props {
  params: Promise<{
    subcategory: string
  }>
}

const Page = async ({ params }: Props) => {

  const { subcategory } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.products.getMany.queryOptions({ // Prefetch de productos con populate de subcategory
    category: subcategory
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList category={subcategory} />
      </Suspense>
    </HydrationBoundary>

  )
}

export default Page