import { ReviewsGetOneOutput } from "@/modules/reviews/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


import { useTRPC } from "@/app/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarPicker } from "@/components/star-picker"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
 
interface Props {
  productId: string;
  initialData?: ReviewsGetOneOutput;
}

const formScheam = z.object({
  rating: z.number().min(1, {message: "Rating is required"}).max(5),
  description: z.string().min(1, {message: "Description is required"}),
});




export const ReviewForm = ({ productId, initialData}: Props) => {

  const [isPreview, setIsPreview] = useState(!!initialData); // Si el producto tiene reviews previamente, se muestra el botón de previsualización, sino el de post

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createReview = useMutation(trpc.reviews.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.reviews.getOne.queryOptions({ productId }));
      setIsPreview(true)
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }));
  
  const updateReview = useMutation(trpc.reviews.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.reviews.getOne.queryOptions({ productId }));
      setIsPreview(true)
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }));

  const form = useForm<z.infer<typeof formScheam>>({
    resolver: zodResolver(formScheam),
    defaultValues: {
      rating: initialData?.rating ?? 0,
      description: initialData?.description ?? "",
    }
  });

  const onSubmit = (values: z.infer<typeof formScheam>) => {
    if(initialData){
      updateReview.mutate({
        reviewId: initialData.id,
        rating: values.rating,
        description: values.description,
      })
    }else{
      createReview.mutate({
        productId,
        rating: values.rating,
        description: values.description,
      })
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <p className="font-medium">
          {isPreview ? "Your rating" : "Liked it ? Give it a rating"}
        </p>

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker
                  value={field.value}        // valor del campo del formulario rating
                  onChange={field.onChange}  // Recoge el valor de cambio del campo rating
                  disabled={isPreview}       // Si el producto tiene reviews se deshabilita el campo rating
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder="Want to leave a written review ?"
                  disabled={isPreview}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        

        {!isPreview && (
          <Button
            variant="elevated"
            disabled={false}
            type="submit"
            size="lg"
            className="bg-black text-white hover:bg-pink-400 hover:text-primary w-fit"
          >
            {initialData ? "Update review" : "Post review" }
          </Button>
        )}
      </form>

      {isPreview && (
        <Button
          onClick={() => setIsPreview(false)}
          size="lg"
          type="button"
          variant="elevated"
          className="w-fit"
        >
          Edit
        </Button>
      )}
    </Form>
  )
}
