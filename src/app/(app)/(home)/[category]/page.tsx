import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/app/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/views/product-list-view";




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
  void queryClient.prefetchQuery(trpc.products.getMany.queryOptions({ // Prefetch de productos con populate de category y filtro aplicados en url
    category,
    ...filters
  }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} />
    </HydrationBoundary>  
  )
}

export default Page