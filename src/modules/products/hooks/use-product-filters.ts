import { useQueryStates, parseAsString, parseAsArrayOf, parseAsStringLiteral } from "nuqs";

const sortValues = ['curated', 'trending', 'hot_and_new'] as const;

const params = {
  sort: parseAsStringLiteral(sortValues)     // parseAsStringLiteral indica a nuqs que trate como string "?sort=.." 
    .withDefault('curated'),                 
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




