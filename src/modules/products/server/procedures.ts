
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { Category, Media, Tenant } from "@/payload-types";
import type { Sort, Where } from "payload";
import { z } from "zod";
import { sortValues } from "../search-params";
import { DEFAULT_LIMIT } from "@/constants";
import { headers as getHeaders } from "next/headers";


export const productsRouter = createTRPCRouter({

  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2,                                          // load product.image, product.tenant & product.tenant.image
        select: {                                          // Se excluye el campo "content" de la consulta
          content: false,
        }
      });

      let isPurchased = false;                             // Por defecto el producto no se ha comprado

      if(session.user){                                    // Si el usuario está autenticado
        const ordersData = await ctx.db.find({
          collection: "orders",                            // Buscamos en la colección "orders"
          pagination: false,
          limit: 1,
          where: {
            and: [
              {
                product: {                                 // si el producto de la orden  
                  equals: input.id,                        // = producto solicitado
                }
              },
              {
                user: {                                    // y el usuario de la orden
                  equals: session.user.id,                 // = usuario autenticado
                }
              }
            ]
          }
        })

        isPurchased = !!ordersData.docs[0];                // Si se encontró una orden con el producto y el usuario, se marca como comprado
      }

      const reviews = await ctx.db.find({                                    // Se buscan los reviews del producto
        collection: "reviews",
        pagination: false,
        where: {
          product: {
            equals: input.id,
          }
        }
      });

      const reviewRating =                                                     // Se calcula la media de las ratings de los reviews
        reviews.docs.length > 0
          ? reviews.docs.reduce((acc, review) => acc + review.rating, 0) / reviews.totalDocs
          : 0;

      const ratingDistribution: Record<number, number> = {                     // Se inicializa un objeto para contar cuántas reseñas hay para cada nivel de estrella (de 1 a 5).
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };

      if(reviews.totalDocs > 0){                                                // Si existen reseñas para el producto
        reviews.docs.forEach((review) => {                                      // se itera sobre cada una de ellas
          const rating = review.rating;                                         // se extrae su puntuación 
          
          if(rating >= 1 && rating <=5){                                        // si la puntuación es entre 1 y 5
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1; // se incrementa el contador correspondiente
          }
        })

        Object.keys(ratingDistribution).forEach((key) => {                      // Transformamos el objeto ratingDistribution {5: 10, 4: 5, 3: 2, 2: 1, 1: 0}                    
          const rating = Number(key);                                           // En cada iteración se accede a la clave rating (5, 4, etc)                         
          const count =ratingDistribution[rating] || 0;                         // Se accede al valor almacenado en ratingDistribution[rating] o 0 si no existe
          ratingDistribution[rating] = Math.round(                              // Se calcula y actualiza el porcentaje de reseñas para ese nivel de estrella
            (count / reviews.totalDocs) * 100
          )
        })
      }
    

      return {
        ...product,
        isPurchased,                                                            // Se agrega la propiedad isPurchased
        image: product.image as Media | null,                                   // Aseguramos que la propiedad image sea de tipo Media
        tenant: product.tenant as Tenant & { image: Media | null },             // Aseguramos que el campo tenant añadida por el plugin multitenant sea de tipo Tenant y su propiedad image sea de tipo Media
        reviewRating,
        reviewCount: reviews.totalDocs,
        ratingDistribution,
      }
    }),
  
  getMany: baseProcedure
    .input(
      z.object({
        // Define los parámetros de entrada para filtrar productos y paginar
        cursor: z.number().default(1),                
        limit: z.number().default(DEFAULT_LIMIT),
        // Define los parámetros de entrada para filtrar productos
        category: z.string().nullable().optional(),              // Slug de la categoría para filtrar
        minPrice: z.string().nullable().optional(),              // Precio mínimo (como string)
        maxPrice: z.string().nullable().optional(),              // Precio máximo (como string)
        tags: z.array(z.string()).nullable().optional(),         // Arreglo de slugs de etiquetas para filtrar
        sort: z.enum(sortValues).nullable().optional(),          // Orden de los productos
        tenantSlug: z.string().nullable().optional(),            // Slug de la tienda para filtrar
      })
    )
    .query(async ({ ctx, input }) => {               
      const where: Where = {};                       // Inicializa un objeto vacío para construir las condiciones de búsqueda
      let sort: Sort = "-createdAt";                 // Inicializa un objeto vacío para construir el orden de los productos

      if(input.sort === "curated"){
        sort = "-createdAt";
      }

      if(input.sort === "hot_and_new"){
        sort = "+createdAt";
      }

      if(input.sort === "trending"){
        sort = "-createdAt";
      }


      // Se asignan los filtros de precio 
      // al objeto where
      if (input.minPrice && input.maxPrice) {        // Si se proporcionan ambos precios, crea un rango de precios 
        where.price = { 
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice
        }
      } else if (input.minPrice) {                    // Si solo se proporciona precio mínimo se asigna un filtro para productos con precio mayor o igual
        where.price = {
          greater_than_equal: input.minPrice,
        }
      } else if (input.maxPrice) {                    // Si solo se proporciona precio máximo se asigna un filtro para productos con precio menor o igual
        where.price ={
          less_than_equal: input.maxPrice,
        }
      }

      if (input.tenantSlug) {                          // Si se proporciona un slug de tienda, construye filtros basados en el nombre de la tienda
        where["tenant.slug"] = {
          equals: input.tenantSlug
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

      if(input.tags && input.tags.length > 0) {                     // Si se proporcionan tags, crea un filtro para buscar productos que tengan al menos una de las etiquetas
        where["tags.name"] = {
          in: input.tags
        }
      }
      
      const data = await ctx.db.find({                              // 5. Realiza la consulta final para obtener los productos filtrados
        collection: "products",                                     // Se busca en la colección "products"
        depth: 2,                                                   // Se hace populate de "category", "image" & "tenant" & "tenant.image"
        where,                                                      // Aplica todos los filtros configurados (precio y/o categoría)
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {                                                   // Se excluye el campo "content" de la consulta
          content: false,
        }
      });

      const dataWithSummarizedReviews = await Promise.all(
        data.docs.map(async (doc) => {                              // Se mapean todos los productos
          const reviewsData = await ctx.db.find({                   // y por cada producto se busca un documento en la colección reviews
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          })

          return {
            ...doc,                                                 // Se devuelven los productos con reviews
            reviewCount: reviewsData.totalDocs,                     // el número de reviews para este producto y
            reviewRating:                                           // la media de las ratings de los reviews
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / reviewsData.totalDocs
          }
        })
      )
  
      return {
        ...data,                                                    // Devuelve los datos originales de data (productos y paginación)
        docs: dataWithSummarizedReviews.map((doc) => ({             // y se sobrescribe la prop docs que se propago desde data con los datos de reviews
          ...doc,
          image: doc.image as Media | null,                         // Aseguramos que la propiedad image sea de tipo Media
          tenant: doc.tenant as Tenant & { image: Media | null },   // Aseguramos que la propiedad tenant sea de tipo Tenant
          
        }))
      }
    


  })
})