


import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/app/trpc/routers/_app";

export type CategoriesGetManyOutput = inferRouterOutputs<AppRouter>["categories"]["getMany"]; // Se infiere el tipo de salida de la ruta categories.getMany