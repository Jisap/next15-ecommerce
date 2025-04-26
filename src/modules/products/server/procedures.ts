
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";


export const productsRouter = createTRPCRouter({
  
  getMany: baseProcedure.query(async ({ ctx }) => { // Este procedimiento recibe el ctx de trpc que contiene la instancia de payload

    const data = await ctx.db.find({                // La consulta es a Payload
      collection: "products",
      depth: 1,                                     // Se hace populate de "category" & "image"
    });

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulación de una tarea de procesamiento de datos

    return data;
  })
})