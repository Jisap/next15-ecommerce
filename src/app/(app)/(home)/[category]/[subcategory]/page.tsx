import { getQueryClient, trpc } from "@/app/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/views/product-list-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SearchParams } from "nuqs";



interface Props {
  params: Promise<{
    subcategory: string
  }>
  searchParams: Promise<SearchParams>
}

const Page = async ({ params, searchParams }: Props) => {

  const { subcategory } = await params;
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({ // Prefetch de productos con populate de category y filtro aplicados en url
    category: subcategory,
    ...filters,
    limit: DEFAULT_LIMIT
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={subcategory} />
    </HydrationBoundary>
  )
}

export default Page