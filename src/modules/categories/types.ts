


import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/app/trpc/routers/_app";



export type CategoriesGetManyOutput = inferRouterOutputs<AppRouter>["categories"]["getMany"]; // Se infiere el tipo de salida de la ruta categories.getMany
export type CategoriesGetManyOutputSingle = CategoriesGetManyOutput[0];                       // Se infiere el tipo para el caso de que solo se devuelva un elemento