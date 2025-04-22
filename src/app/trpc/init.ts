import { initTRPC } from '@trpc/server';                      // punto de entrada para inicializar tRPC en el lado del servidor.
import { cache } from 'react';                                // se utiliza para memoizar funciones, es decir, para que una función se ejecute solo una vez y sus resultados se almacenen en caché.

export const createTRPCContext = cache(async () => {          // Se crea un contexto para trpc, se utiliza para almacenar datos de usuario y otros datos que se necesiten en la aplicación.
  return { userId: 'user_123' };
});

const t = initTRPC.create({                                   // Instancia tRPC -> crea createTRPCRouter que sirve para crear rutas trcp en _app
  
});

export const createTRPCRouter = t.router;                     // Se exporta la función router de la instancia de tRPC. Los routers son estructuras que contienen procedimientos (consultas y mutaciones) y definen la API de la aplicación.
export const createCallerFactory = t.createCallerFactory;     // "llamador" (caller) para ejecutar procedimientos de tRPC desde el lado del servidor.
export const baseProcedure = t.procedure;                     // Se exporta la función procedure, que es la base para definir procedimientos en tRPC. Los procedimientos pueden ser consultas (query) o mutaciones (mutation) y son los bloques de construcción de la API, permitiendo definir la lógica de negocio.