


import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/app/trpc/routers/_app";



export type ProductsGetManyOutput = inferRouterOutputs<AppRouter>["products"]["getMany"]; // Se infiere el tipo de salida de la ruta products.getMany
