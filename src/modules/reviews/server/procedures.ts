
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const reviewsRouter = createTRPCRouter({         // reviewsRouter define un endpoint getOne

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
    })
})