import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/app/trpc/server";
import { ProductFilters } from "@/modules/products/ui/components/product-filters";
import { ProductList, ProductListSkeleton } from "@/modules/products/ui/components/product-list";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { loadProductFilters } from "@/modules/products/hooks/use-product-filters";



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
      <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
          <div className="lg:col-span-2 xl:col-span-2">
            <div className="border p-2">
              <ProductFilters />
            </div>
          </div>

          <div className="lg:col-span-4 xl:col-span-6">
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList category={category} />
            </Suspense>
          </div>
        </div>
      </div>
    </HydrationBoundary>
    
  )
}

export default Page