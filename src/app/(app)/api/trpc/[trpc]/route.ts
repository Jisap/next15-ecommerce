import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/app/trpc/init';
import { appRouter } from '@/app/trpc/routers/_app';

// En tRPC, necesitas crear un endpoint de API en el servidor que actúe como punto de entrada para todas las peticiones tRPC desde el cliente.
// TRPC funciona con http y necesita un endpoint al que enviar todas las solitudes

const handler = (req: Request) =>                    // 1º recibe la solicitud http
  fetchRequestHandler({                              // 2º llama a fetchRequestHandler
    endpoint: '/api/trpc',                           // 3º Ejecuta en la ruta /api/trpc el procedimiento especificado en la petición
    req,                                             // 4º Devuelve el resultado serializado al client                             
    router: appRouter,                               
    createContext: createTRPCContext,
  });
export { handler as GET, handler as POST };