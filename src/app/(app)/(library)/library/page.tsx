import { getQueryClient, trpc } from '@/app/trpc/server';
import { DEFAULT_LIMIT } from '@/constants';
import LibraryView from '@/modules/library/ui/views/library-view'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

const Page = async() => {

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.library.getMany.infiniteQueryOptions({  // Prefetch de productos desde library.getMany
    limit: DEFAULT_LIMIT,
  }))

  return (
    // HydrationBoundary transfiere el estado precargado del servidor al cliente
    <HydrationBoundary state={dehydrate(queryClient)}> 
      <LibraryView />
    </HydrationBoundary>
  )
}

export default Page