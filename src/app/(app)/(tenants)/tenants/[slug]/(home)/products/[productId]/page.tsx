import { getQueryClient, trpc } from "@/app/trpc/server";
import { ProductView, ProductViewSkeleton } from "@/modules/products/views/product-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{productId: string; slug: string}>;
}

const page = async({ params }: Props) => {

  const { productId, slug } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ // Prefetch de un tenant según el slug de la url
    slug
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView 
          productId={productId}
          tenantSlug={slug}
        />
      </Suspense>
    </HydrationBoundary>
  )
}

export default page