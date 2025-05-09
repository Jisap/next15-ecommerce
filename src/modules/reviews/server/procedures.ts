
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const reviewsRouter = createTRPCRouter({           // reviewsRouter define un endpoint getOne para obtener una review de un producto

  getOne: protectedProcedure                            
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.findByID({             // Se busca el producto en base al id del producto 
        collection: 'products',
        id: input.productId,
      });

      if(!product){
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        })
      }

      const reviewData = await ctx.db.find({               // De ese producto se extrae la lista de reviews
        collection: 'reviews',
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: input.productId,                   // que se corresponden con el producto buscado
              }
            },
            {
              user: {
                equals: ctx.session.user.id,               // y que pertenezcan al usuario autenticado
              }
            }
          ]
        }
      })

      const review = reviewData.docs[0]                     // Se extrae el primer review

      if(!review){
        return null;
      }

      return review;
    }),

  create: protectedProcedure                                                       // Endpoint create para crear una review
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z.string().min(1, { message: "Description is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.findByID({                                      // Se busca el producto en base al id del producto
        collection: 'products',
        id: input.productId,
      });

      if(!product){
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        })
      }

      const existingReviewData = await ctx.db.find({                               // Vemos si hay una review existente correspondiente al producto y el usuario           
        collection: 'reviews',
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              }
            },
            {
              user: {
                equals: ctx.session.user
              }
            }
          ]
        }
      })

      if(existingReviewData.totalDocs > 0){
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have a review for this product",
        })
      }

      const review = await ctx.db.create({                                         // Si no hay una review existente, se crea una nueva
        collection: "reviews",
        data: {
          user: ctx.session.user.id,
          product: product.id,
          rating: input.rating,
          description: input.description,
        }
      })

      return review;

  }),

  update: protectedProcedure                                                       // Endpoint updatete para actualizar una review
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z.string().min(1, { message: "Description is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingReview = await ctx.db.findByID({                                      // Se busca la review en base al id de la review
        collection: 'reviews',
        depth: 0, // existingReview.user -> user ID
        id: input.reviewId,
      });

      if(!existingReview){
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        })
      }

      if(existingReview.user !== ctx.session.user.id){
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this review",
        })
      }

      const updatedReview = await ctx.db.update({                                         // Si hay una review existente, se actualiza
        collection: "reviews",
        id: input.reviewId,
        data: {
          rating: input.rating,
          description: input.description,
        }
      })

      return updatedReview

    })
})