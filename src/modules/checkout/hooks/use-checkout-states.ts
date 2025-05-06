

import { parseAsBoolean, useQueryStates } from "nuqs";

export const useCheckoutStates = () => {
  return useQueryStates({
    success: parseAsBoolean   // El valor del parámetro success debe ser un booleano
      .withDefault(false)     // Si success no esta presente en la url se establece su valor a false
      .withOptions({ 
        clearOnDefault: true  // Si su valor es false se eliminará de la url
      }),
    cancel: parseAsBoolean
      .withDefault(false)
      .withOptions({
        clearOnDefault: true
      }),

  })
}