import { Suspense } from "react";
import Footer from "../../../modules/home/ui/components/Footer";
import { Navbar } from "../../../modules/home/ui/components/Navbar";
import { SearchFilters, SearchFiltersLoading } from "../../../modules/home/ui/components/search-filter";

import { getQueryClient, trpc } from '@/app/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const queryClient = getQueryClient();      // Instancia de QueryClient
  void queryClient.prefetchQuery(
    trpc.categories.getMany.queryOptions()   // Prefetch de datos en el router categories que llama al procedimiento getMany
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* HydrationBoundary transfiere el estado precargado del servidor al cliente */}
      <HydrationBoundary state={dehydrate(queryClient)}>   
        <Suspense fallback={<SearchFiltersLoading />}>
          <SearchFilters />
        </Suspense>
        <div className="flex-1 bg-[#f4f4f0]">
          {/* Solución al problema del deployment "useSearchParams should be wrapped in a suspense boundary" */}
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </HydrationBoundary>
      <Footer />
    </div>
  )
}

export default Layout