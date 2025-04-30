import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/app/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/views/product-list-view";
import { DEFAULT_LIMIT } from "@/constants";




interface Props {
  params: Promise<{
    category: string                           // Se reciben los params de la ruta de la URL [category]
  }>,
  searchParams: Promise<SearchParams>          // Se reciben los searchParams de la consulta de la URL [minPrice, maxPrice]
}

const Page = async({ params, searchParams }: Props) => {

  const { category } = await params;
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ // Prefetch de productos con populate de category y filtro aplicados en url
    category,
    ...filters,
    limit: DEFAULT_LIMIT
  }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} />
    </HydrationBoundary>  
  )
}

export default Page