import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/app/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/views/product-list-view";
import { DEFAULT_LIMIT } from "@/constants";




interface Props {
  searchParams: Promise<SearchParams>          // Se reciben los searchParams de la consulta de la URL [minPrice, maxPrice]
}

const Page = async ({ searchParams }: Props) => {

  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ // Prefetch de productos con populate de category y filtro aplicados en url
    ...filters,
    limit: DEFAULT_LIMIT
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView />
    </HydrationBoundary>
  )
}

export default Page
