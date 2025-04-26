
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { Category } from "@/payload-types";
import type { Where } from "payload";
import { z } from "zod";


export const productsRouter = createTRPCRouter({
  
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => { 
      const where: Where = {};

      if(input.minPrice) {
        where.price = {
          greater_than_equal: input.minPrice
        }
      }

      if(input.maxPrice) {
        where.price = {
          less_than_equal: input.maxPrice
        }
      }

      if(input.category) {    
        const categoriesData = await ctx.db.find({                // 1º Se busca la categoría con el slug proporcionado por el usuario
          collection: "categories",
          limit: 1,                                               // Se limita a 1 resultado (los slugs son únicos)
          depth: 1,                                               // Se hace populate de "subcategories"
          pagination:false,
          where: {
            slug: {
              equals: input.category
            }
          }
        })

        const formattedData = categoriesData.docs.map((doc) => ({  // Se formatea el dato de la categoría encontrada
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            ...(doc as Category),      // Se hace esto porque depth: 1 no devuelve el tipo correcto
            //subcategories: undefined,  // No se hace populate de las subcategories aninadas debido a depth: 1 
          }))
        }))

        const subcategoriesSlugs = [];
        const parentCategory = formattedData[0];                 // Se obtiene la categoría padre

        if(parentCategory){                                      // Si la categoría padre existe
          subcategoriesSlugs.push(                               // Recolecta los slugs de las subcategorías DIRECTAS.
            ...parentCategory.subcategories.map((subcategory) => subcategory.slug) // mapea las subcategorías (obtenidas por depth 1) y extrae su slugs
          )

          where["category.slug"] = {                             // Se establece la condición de busqueda de productos basada en los slugs de las subcategorias: Busca productos cuyo slug de categoría asociada cumpla con esta condición 
            in: [                                                // estar en la lista
              parentCategory.slug,                               // de las categorías padre
              ...subcategoriesSlugs                              // o de las subcategorías directas
            ]
          }                 
        } 
      }
      
      const data = await ctx.db.find({                           // 2º consulta a Payload
        collection: "products",                                  // Se busca en la colección "products"
        depth: 1,                                                // Se hace populate de "category" & "image"
        where                                                    // Filtro: el slug de la categoría del producto debe coincidir con el de la categoría principal o cualquiera de sus subcategorías
      })
  
      return data;
    


  })
})