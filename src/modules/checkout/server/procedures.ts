
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { Category, Media, Tenant } from "@/payload-types";
import type { Sort, Where } from "payload";
import { z } from "zod";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";


export const checkoutRouter = createTRPCRouter({
  
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {               
      
      const data = await ctx.db.find({                              // 5. Realiza la consulta final para obtener los productos filtrados
        collection: "products",                                     // Se busca en la colección "products"
        depth: 2,                                                   // populate de "category", "image" & "tenant" & "tenant.image"
        where: {                                                  
          id: {
            in: input.ids
          }
        },
      });

      if(data.totalDocs !== input.ids.length){
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

  
      return {
        ...data,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,                         // Aseguramos que la propiedad image sea de tipo Media
          tenant: doc.tenant as Tenant & { image: Media | null },   // Aseguramos que la propiedad tenant sea de tipo Tenant
          
        }))
      }
    


  })
})