import { initTRPC } from '@trpc/server';                      // punto de entrada para inicializar tRPC en el lado del servidor.
import { cache } from 'react';                                // se utiliza para memoizar funciones, es decir, para que una función se ejecute solo una vez y sus resultados se almacenen en caché.
import config from "@payload-config";                         // se utiliza para obtener la configuración de Payload.
import { getPayload } from 'payload'; 


export const createTRPCContext = cache(async () => {          // Se crea un contexto para trpc, se utiliza para almacenar datos de usuario y otros datos que se necesiten en la aplicación.
  return { userId: 'user_123' };
});

const t = initTRPC.create({                                   // Instancia tRPC -> crea createTRPCRouter que sirve para crear rutas trcp en _app
  
});

export const createTRPCRouter = t.router;                     // Función router de la instancia de tRPC. Los routers son estructuras que contienen procedimientos (consultas y mutaciones) y definen la API de la aplicación.
export const createCallerFactory = t.createCallerFactory;     // "llamador" (caller) para ejecutar procedimientos de tRPC desde el lado del servidor.


// baseProcedure define procedimientos que se pueden llamar desde el lado del cliente.
// Cuando se ejecute este procedimiento tendremos acceso a la instancia de payload. Esto permitirá:
//      1º Consultar y manipular las colecciones de Payload
//      2º Acceder a usuarios, autenticación y otras funcionalidades de Payload
//      3º Realizar operaciones de base de datos dentro de tus procedimientos tRPC

export const baseProcedure = t.procedure.use(async({ next }) => { 
  const payload = await getPayload({ config })                    // Instancia de payload
  return next({ ctx: { db: payload }})                            // Añadimos la instancia al contexto de trpc
})                     