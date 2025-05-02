import { getQueryClient, trpc } from "@/app/trpc/server";
import { ProductView } from "@/modules/products/views/product-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

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
      <ProductView 
        productId={productId}
        tenantSlug={slug}
      />
    </HydrationBoundary>
  )
}

export default page