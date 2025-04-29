import { useQueryStates} from "nuqs";
import { parseAsString, parseAsArrayOf, createLoader, } from "nuqs/server"; // Se importa desde /server para asegurar que esta definición sea compatible y funcione correctamente tanto en entornos de servidor como de cliente.

export const params = {
  minPrice: parseAsString                    // parseAsString indica a nuqs que trate como string "?minPrice=.."       
    .withOptions({
      clearOnDefault: true,                  // Si el valor por defecto es vacío, se borra la cadena de consulta    
    }),
  maxPrice: parseAsString
    .withOptions({
      clearOnDefault: true,
    }),
  tags: parseAsArrayOf(parseAsString)        // parseAsArrayOf indica a nuqs que trate como array de strings "?tags[]=.."
    .withOptions({
      clearOnDefault: true,                  // Si el valor por defecto es vacío, se borra la cadena de consulta
    }),
}

export const useProductFilters = () => {     // nuqs gestiona el estado de la cadena de consulta en la URL
  return useQueryStates(params)              // Se definen así dos variables que cuando cambian actualizan la cadena de consulta.
}


export const loadProductFilters = createLoader(params);  // createLoader crea un loader que se puede utilizar en cualquier componente de React

// 1º loadProductFilters es una herramienta del servidor para obtener los valores de los filtros desde la URL entrante
// Lee y valida los searchParams en el servidor, y se ejecuta dentro del componente de servidor Page (en [category]/page.tsx).

// 2º El resultado de loadProductFilters (filters) se usa inmediatamente en el servidor para hacer prefetchQuery 
// de los datos de tRPC (trpc.products.getMany).

// 3º Esos datos es lo que se hidrata a través de <HydrationBoundary state={dehydrate(queryClient)}> 
// y el componente ProductList en el cliente leerá estos datos hidratados desde la caché de React Query.

// 4º Los componentes del cliente ProductFilters y ProductList usan useProductFilters para leer y modificar 
// el estado de los filtros directamente en la url del navegador.