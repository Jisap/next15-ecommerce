
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import type { Where } from "payload";
import { z } from "zod";


export const productsRouter = createTRPCRouter({
  
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional()
      })
    )
    .query(async ({ ctx, input }) => { 
      const where: Where = {};

      if(input.category) {    
          where["category.slug"] = {               // Se agrega una condición de busqueda a la consulta
            equals: input.category,                // category.slug === input.category
          }
      }

    const data = await ctx.db.find({                // La consulta es a Payload
      collection: "products",                       // Se busca en la colección "products"
      depth: 1,                                     // Se hace populate de "category" & "image"
      where                                         // Se aplica la condición de busqueda: category.slug === input.category
    })

    //await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulación de una tarea de procesamiento de datos

    return data;
  })
})