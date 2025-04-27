
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { Category } from "@/payload-types";
import type { Where } from "payload";
import { z } from "zod";


export const productsRouter = createTRPCRouter({
  
  getMany: baseProcedure
    .input(
      z.object({
        // Define los parámetros de entrada para filtrar productos
        category: z.string().nullable().optional(),  // Slug de la categoría para filtrar
        minPrice: z.string().nullable().optional(),  // Precio mínimo (como string)
        maxPrice: z.string().nullable().optional(),  // Precio máximo (como string)
      })
    )
    .query(async ({ ctx, input }) => { 
      const where: Where = {};                       // Inicializa un objeto vacío para construir las condiciones de búsqueda

      if (input.minPrice) {                          // Si se proporciona un precio mínimo, añade un filtro para productos con precio mayor o igual
        where.price = {
          greater_than_equal: input.minPrice
        }
      }

      if (input.maxPrice) {                           // Si se proporciona un precio máximo, añade un filtro para productos con precio menor o igual
        where.price = {
          less_than_equal: input.maxPrice
        }
      }

      if (input.category) {                            // Si se proporciona un slug de categoría, construye filtros basados en la jerarquía de categorías
        const categoriesData = await ctx.db.find({                 // 1. Busca la categoría específica por su slug
          collection: "categories",
          limit: 1,                                                // Solo necesitamos un resultado ya que los slugs son únicos
          depth: 1,                                                // "Populate" las subcategorías directas (un nivel de profundidad)
          pagination: false,                                       // No necesitamos metadatos de paginación
          where: {
            slug: {
              equals: input.category                               // Busca categoría con slug exacto
            }
          }
        })

        const formattedData = categoriesData.docs.map((doc) => ({  // 2. Formatea los datos de la categoría encontrada para un uso más fácil
          ...doc,                                                  // Asegura que las subcategorías tengan el tipo correcto y estén correctamente estructuradas
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            ...(doc as Category),                                             // Fuerza el tipo Category en las subcategorías
            //subcategories: undefined,                                       // No incluimos subcategorías anidadas más profundas
          }))
        }))

        const subcategoriesSlugs = [];                              // 3. Prepara para recolectar los slugs de todas las subcategorías directas
        const parentCategory = formattedData[0];                    // Obtiene la categoría principal encontrada (si existe)

        if (parentCategory) {                                       // Si se encontró la categoría solicitada
          subcategoriesSlugs.push(                                  // Extrae los slugs de todas las subcategorías directas
            ...parentCategory.subcategories.map((subcategory) => subcategory.slug) 
          )

          where["category.slug"] = {                                // 4. Configura el filtro para buscar productos en la categoría principal O cualquiera de sus subcategorías directas. Busca productos cuyo slug de categoría asociada cumpla con esta condición 
            in: [                                                   // estar en la lista
              parentCategory.slug,                                  // de las categorías padre
              ...subcategoriesSlugs                                 // o de las subcategorías directas
            ]
          }                 
        } 
      }
      
      const data = await ctx.db.find({                              // 5. Realiza la consulta final para obtener los productos filtrados
        collection: "products",                                     // Se busca en la colección "products"
        depth: 1,                                                   // Se hace populate de "category" & "image"
        where                                                       // Aplica todos los filtros configurados (precio y/o categoría)
      })
  
      return data;
    


  })
})