'use client';

import type { QueryClient } from '@tanstack/react-query';                   // Son parte de React Query, se usan para manejar el cache y fetching de datos.
import { QueryClientProvider } from '@tanstack/react-query';                // y fetching de datos.
import { createTRPCClient, httpBatchLink } from '@trpc/client';             // Son parte de tRPC, para crear el cliente y configurar cómo se hacen las peticiones (con batching).
import { createTRPCContext } from '@trpc/tanstack-react-query';             // Función que integra tRPC con React Query.
import { useState } from 'react';
import { makeQueryClient } from './query-client';                           // Función personalizada que inicializa un QueryClient con la configuración deseada.
import type { AppRouter } from './routers/_app';                            // Tipo que representa todas las rutas de tu API tRPC.



// Contexto de trpc
export const { 
  TRPCProvider,                                                             // Provider de tRPC que provee el cliente de tRPC al árbol de componentes.
  useTRPC                                                                   // Hook para usar tRPC con tipado completo.
} = createTRPCContext<AppRouter>();                                         // Crea el contexto de tRPC utilizando el tipo AppRouter


// Cliente React Query (solo en cliente)
let browserQueryClient: QueryClient;                                        // Declara una variable para almacenar el QueryClient en el lado del cliente, inicializada solo cuando sea necesario.

function getQueryClient() {                                                 // Función que devuelve el QueryClient en el lado del cliente.
  if (typeof window === 'undefined') { 
    return makeQueryClient();                                               // Si estamos en el servidor devuelve un QueryClient en cada render 
  }

  if (!browserQueryClient) browserQueryClient = makeQueryClient();          // Si es el lado del cliente, devuelve el QueryClient creado previamente. (Si todavía no se ha creado el QueryClient, créalo y guárdalo en browserQueryClient.)
  return browserQueryClient;
}

// Obtener URL del API
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';                           // Si es el lado del cliente, devuelve una cadena vacía (rutas relativas).
    return process.env.NEXT_PUBLIC_APP_URL;                                 // Si es el lado del servidor, devuelve la URL de la API (usar la base URL).
  })();

  return `${base}/api/trpc`;
}


// Proveedor de tRPC + React Query
export function TRPCReactProvider( props: Readonly<{children: React.ReactNode}>) {
  
  const queryClient = getQueryClient();                                    // Crea un nuevo QueryClient en el servidor (SSR). Reutiliza uno ya existente en el cliente, si ya fue creado. Se usa para que React Query tenga una sola fuente de verdad del estado de los datos.
  
  const [trpcClient] = useState(() =>                                      // Crea un client trpc (habla con el backend) con useState para que sea inmutable y no se vuelva a crear cada vez que se renderiza el componente. (Así no se rompe el cache de React Query)
    createTRPCClient<AppRouter>({                                          // para ello se usa el tipo generado automáticamente que representa todas tus rutas tRPC.
      links: [                                                             // un "link" de tRPC que agrupa varias llamadas HTTP en una sola → mejora el rendimiento. 
        httpBatchLink({
          // transformer: superjson, <-- if you use a data transformer
          url: getUrl(),
        }),
      ],
    }),
  );

  // tRPC es quien inicia y configura la conexión al backend.
  // Sabe que ruta se llama, que parametros se pasan , a que url apuntar y como parsear la respuesta de forma segura (type-safe).
  // Tanstack no sabe de rutas ni de api, solo sabe que le pasan una función y administa su resultado (cache, refetching, etc.)
  return (
    <QueryClientProvider 
      client={queryClient}                                                // controla cómo se hacen las peticiones, cómo se cachean, cómo se invalidan, refetching, estados (isLoading, isError, etc.).
    >
      <TRPCProvider 
        trpcClient={trpcClient}                                           // cliente que sabe cómo conectarse a tu backend tRPC (basado en las rutas definidas en AppRouter) y sabe qué tipos esperar gracias al TypeScript inferido.
        queryClient={queryClient}
      >
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}