
import { createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { z } from "zod";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";



export const libraryRouter = createTRPCRouter({

  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {

      const ordersData = await ctx.db.find({                                   // Realiza la consulta para obtener la orden que contiene el prodcuto comprado por el usuario autenticado
        collection: "orders",                                                  // Se busca en la colección "orders"
        limit: 1,
        pagination: false,                                                     
        where: {
          and: [
            {
              product: {
                equals: input.productId
              
              }
            },
            {
              user: {
                equals: ctx.session.user.id
              }
            }
          ]
        },    
      });

      const order = ordersData.docs[0]                                         // Extrae el id del producto de la orden

      if(!order){
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        })
      }

      const product = await ctx.db.findByID({                                 // Se buscan el producto en base al id del producto de la orden
        collection: "products",
        id: input.productId,
      });

      if(!product){
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        })
      }

      return product
    }),
  
  getMany: protectedProcedure
    .input(
      z.object({
        // Define los parámetros de entrada para paginar
        cursor: z.number().default(1),                
        limit: z.number().default(DEFAULT_LIMIT),
        
      })
    )
    .query(async ({ ctx, input }) => {               
      
      const ordersData = await ctx.db.find({                                   // Realiza la consulta para obtener los productos de la orden del usuario autenticado
        collection: "orders",                                                  // Se busca en la colección "orders"
        depth: 0,                                                              // No se hace populate de nada,                                                   // Se hace populate de "category", "image" & "tenant" & "tenant.image"
        where: {
          user: {
            equals: ctx.session.user.id                                        // Busca los productos de la orden del usuario actual
          }
        },
        page: input.cursor,
        limit: input.limit,
      });

      const productsIds = ordersData.docs.map((order) => order.product);       // Extrae los ids de los productos de la orden
  
      const productsData = await ctx.db.find({                                 // Se buscan los productos que pertenecen a los ids de las ordenes
        collection: "products",
        pagination: false,
        where: {
          id: {
            in: productsIds
          }
        }
      })

      const dataWithSummarizedReviews = await Promise.all(
        productsData.docs.map(async (doc) => {                                // Se mapean todos los productos
          const reviewsData = await ctx.db.find({                             // y por cada producto se busca un documento en la colección reviews
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          })

          return {
            ...doc,                                                           // Se devuelven los productos con reviews
            reviewCount: reviewsData.totalDocs,                               // el número de reviews para este producto y
            reviewRating:                                                     // la media de las ratings de los reviews
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / reviewsData.totalDocs
          }
        })
      )

      return {
        ...productsData,                                                      // Se devuelven los datos de los productos de las ordenes
        docs: dataWithSummarizedReviews.map((doc) => ({                       // y se sobrescribe la prop docs con los datos de las reviews
          ...doc,
          image: doc.image as Media | null,                                   // Aseguramos que la propiedad image sea de tipo Media
          tenant: doc.tenant as Tenant & { image: Media | null },             // Aseguramos que la propiedad tenant sea de tipo Tenant
          
        }))
      }
    


  })
})