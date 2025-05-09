
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

  })
})