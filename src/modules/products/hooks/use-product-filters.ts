import {  useQueryStates} from "nuqs";
import { parseAsString, createLoader, } from "nuqs/server"; // Se importa desde /server para asegurar que esta definición sea compatible y funcione correctamente tanto en entornos de servidor como de cliente.

export const params = {
  minPrice: parseAsString                    // parseAsString indica a nuqs que trate como string "?minPrice=.."       
    .withOptions({
      clearOnDefault: true,                  // Si el valor por defecto es vacío, se borra la cadena de consulta    
    }),
  maxPrice: parseAsString
    .withOptions({
      clearOnDefault: true,
    })
}

export const useProductFilters = () => {     // nuqs gestiona el estado de la cadena de consulta en la URL
  return useQueryStates(params)              // Se definen así dos variables que cuando cambian actualizan la cadena de consulta.
}


export const loadProductFilters = createLoader(params);  // createLoader crea un loader que se puede utilizar en cualquier componente de React
