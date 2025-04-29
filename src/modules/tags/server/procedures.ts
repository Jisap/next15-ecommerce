
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { DEFAULT_LIMIT } from "@/constants";
import { z } from "zod";


export const tagsRouter = createTRPCRouter({         // tagsRouter define un endpoit getMany
  
  getMany: baseProcedure                             // que permite a los clientes solicitar una lista paginada de etiquetas a la bd
    .input(
      z.object({
        cursor: z.number().default(1),                
        limit: z.number().default(DEFAULT_LIMIT),      
      })
    )
    .query(async ({ ctx, input }) => {               
      const data = await ctx.db.find({
        collection: 'tags',
        page: input.cursor,
        limit: input.limit,
      })
  
      return data;
    


  })
})