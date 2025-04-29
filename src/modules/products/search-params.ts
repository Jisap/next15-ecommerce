import { parseAsString, parseAsArrayOf, createLoader, parseAsStringLiteral, } from "nuqs/server";

const sortValues = ['curated', 'trending', 'hot_and_new'] as const;

const params = {
  sort: parseAsStringLiteral(sortValues)     // parseAsStringLiteral indica a nuqs que trate como string "?sort=.." 
    .withDefault('curated'),                 
  minPrice: parseAsString                    // parseAsString indica a nuqs que trate como string "?minPrice=.."       
    .withOptions({
      clearOnDefault: true,                  // Si el valor por defecto es vacío, se borra la cadena de consulta    
    })
    .withDefault(''), 
  maxPrice: parseAsString
    .withOptions({
      clearOnDefault: true,
    })
    .withDefault(''), 
  tags: parseAsArrayOf(parseAsString)        // parseAsArrayOf indica a nuqs que trate como array de strings "?tags[]=.."
    .withOptions({
      clearOnDefault: true,                  // Si el valor por defecto es vacío, se borra la cadena de consulta
    })
    .withDefault([]),
}

export const loadProductFilters = createLoader(params);

// 1º loadProductFilters es una herramienta del servidor para obtener los valores de los filtros desde la URL entrante
// Lee y valida los searchParams en el servidor, y se ejecuta dentro del componente de servidor Page (en [category]/page.tsx).

// 2º El resultado de loadProductFilters (filters) se usa inmediatamente en el servidor para hacer prefetchQuery
// de los datos de tRPC (trpc.products.getMany).

// 3º Esos datos es lo que se hidrata a través de <HydrationBoundary state={dehydrate(queryClient)}>
// y el componente ProductList en el cliente leerá estos datos hidratados desde la caché de React Query.

// 4º Los componentes del cliente ProductFilters y ProductList usan useProductFilters para leer y modificar
// el estado de los filtros directamente en la url del navegador.