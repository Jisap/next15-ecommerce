


import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/app/trpc/routers/_app";



export type ReviewsGetOneOutput = inferRouterOutputs<AppRouter>["reviews"]["getOne"]; // Se infiere el tipo de salida de la ruta categories.getMany
