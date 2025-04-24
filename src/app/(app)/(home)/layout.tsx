
import { Suspense } from "react";
import Footer from "./Footer";
import { Navbar } from "./Navbar";
import { SearchFilters, SearchFiltersLoading } from "./search-filter";

import { getQueryClient, HydrateClient, trpc } from '@/app/trpc/server';
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
      </HydrationBoundary>
      <div className="flex-1 bg-[#f4f4f0]">
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout