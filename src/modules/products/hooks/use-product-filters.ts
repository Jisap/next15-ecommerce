import { parseAsString, useQueryStates} from "nuqs"

export const useProductFilters = () => { // nuqs gestiona el estado de la cadena de consulta en la URL
  return useQueryStates({
    minPrice: parseAsString              // parseAsString indica a nuqs que trate como string "?minPrice=.."
      .withOptions({
        clearOnDefault: true,            // Si el valor por defecto es vacío, se borra la cadena de consulta
      }),
    maxPrice: parseAsString
      .withOptions({
        clearOnDefault: true,
      })
  })
}

// Se definen dos variables que cuando cambian actualizan la cadena de consulta.