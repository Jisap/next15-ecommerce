import { useTRPC } from '@/app/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ReviewForm } from './review-form';


interface Props {
  productId: string
}

export const ReviewSidebar = ({ productId }: Props) => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.reviews.getOne.queryOptions({ // useSuspenseQuery cada vez que se actualiza el productId permite obtener 
    productId                                                          // los reviews de un producto que previamente han sido prefetchs en el componente padre
  }))

  return (
    <div>
      <ReviewForm 
        productId={productId}
        initialData={data}
      />
    </div>
  )
}

