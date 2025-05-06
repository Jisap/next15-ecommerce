import { initTRPC, TRPCError } from '@trpc/server';                      // Biblioteca central de tRPC para crear APIs tipadas
import { cache } from 'react';                                // Función de React para memoizar resultados y evitar cálculos repetidos
import config from "@payload-config";                         // Configuración de Payload CMS
import { getPayload } from 'payload';                         // Función para inicializar/acceder a la instancia de Payload CMS
import { headers as getHeaders } from 'next/headers';


export const createTRPCContext = cache(async () => {          // Creamos un contexto para tRPC envuelto en cache() para mejorar rendimiento        
  return { userId: 'user_123' };                              // El contexto se genera una vez por solicitud y se comparte entre todos los procedimientos
});

const t = initTRPC.create({});                                // Instancia t de trpc, el núcleo que proporciona funciones para construir la api                                 

export const createTRPCRouter = t.router;                     // Con la instancia t se crea la función para crear routers de trpc. Los routers son contenedores que agrupan procedimientos relacionados
export const createCallerFactory = t.createCallerFactory;     // Y también se crea la funcíon caller para invocar procedimientos trpc directamente desde el servidor sin hacer peticiones http


// Con t también creamos baseProcedure, que es la base para todos los procedimientos tRPC (queries y mutations).
// Incorpora un middleware que inyecta la instancia de Payload CMS en el contexto.
// Cada procedimiento creado a partir de esta base tendrá acceso a Payload, lo que permite:
//      1. Consultar y manipular las colecciones de Payload desde los procedimientos
//      2. Acceder a usuarios, autenticación y otras funcionalidades de Payload
//      3. Realizar operaciones de base de datos dentro de los procedimientos tRPC

export const baseProcedure = t.procedure.use(async({ next }) => { 
  const payload = await getPayload({ config })                    // Instancia de payload
  return next({ ctx: { db: payload }})                            // Añadimos la instancia al contexto de trpc
})                     

export const protectedProcedure = baseProcedure.use(async({ ctx, next }) => {
  const headers = await getHeaders();                            // Obtenemos los headers de la petición, incluida la cookie de la autenticación
  const session = await ctx.db.auth({ headers});                 // Payload usa el método auth con la cookie obtenida para ver si hay una session válida

  if(!session || !session.user){                                 // Si no hay session, se lanza una excepción
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized"
    })
  }

  return next({                                                 // Si hay session el middelware (use) llama a next() para ejecutar lo siguiente
    ctx: {                                                      // se enrriquece el contexto de trpc con la session
      ...ctx,
      session: {
        ...session,
        user: session.user,                                     // que incluye el objeto de usuario
      }
    }                                                           // Cualquier query o mutation que use protectedProcedure tendrá 
  })                                                            // acceso  a ctx.session.user permitiendo saber quien es el usuario autenticado y actuar en consecuencia
})