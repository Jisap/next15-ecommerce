

import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { Category } from "@/payload-types";



export const categoriesRouter = createTRPCRouter({
  
  getMany: baseProcedure.query(async ({ ctx }) => { // Este procedimiento recibe el ctx de trpc que contiene la instancia de payload


    const data = await ctx.db.find({                // La consulta es a Payload
      collection: "categories",
      depth: 1,
      pagination: false,
      where: {
        parent: {
          exists: false,
        },
      },
      sort: "name"
    });

    const formattedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
        ...(doc as Category),      // Se hace esto porque depth: 1 no devuelve el tipo correcto
        subcategories: undefined,  // No se hace populate de las subcategories aninadas debido a depth: 1 
      }))
    }))

    return formattedData;
  })
})