import { getQueryClient, trpc } from "@/app/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/views/product-list-view";
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { SearchParams } from "nuqs";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<{slug: string}>;
}

const Page = async ({ params, searchParams }: Props) => {

  const { slug } = await params;
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ // Prefetch de productos con populate de tenant y filtros aplicados en url
    tenantSlug: slug,
    ...filters,
    limit: DEFAULT_LIMIT
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView 
        tenantSlug={slug} 
        narrowView  // true
      />
    </HydrationBoundary>
  )
}

export default Page 