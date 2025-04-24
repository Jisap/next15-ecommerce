import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders, cookies as getCookies } from "next/headers";
import { z } from "zod";
import { AUTH_COOKIE } from "../constants";


export const authRouter = createTRPCRouter({

  session: baseProcedure.query(async ({ ctx }) => { // Este procedimiento recibe el ctx de trpc que contiene la instancia de payload
    
    const headers = await getHeaders();                    // Obtenemos los headers de la petición, incluida la cookie

    const session = await ctx.db.auth({ headers })         // Payload usa esa cookie para verificar si el token es válido

    return session;                                        // Devuelve la sesión (null si no hay usuario autenticado, o el objeto de usuario si lo hay)
  }),

  register: baseProcedure
    // Validación del input usando Zod
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(3, "Password must be at least 3 characters"),
        username: z
          .string()
          .min(3, "Username must be al least 3 characters")
          .max(63, "Username must be less than 63 characters")
          .regex(
            /^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Username can only contain lowercase letters, numbers and hyphens. It must start and en with a letter or number"
          ) 
          .refine(
            (val) => !val.includes("--"), "Username cannot contain consecutive hyphens"
          )
          .transform((val) => val.toLowerCase()),
      })
    )
    .mutation( async ({ input, ctx }) => {
      await ctx.db.create({                         // 1. Se crea un nuevo usuario en la colección 'users' 
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
          username: input.username,
        }
      })

      const data = await ctx.db.login({             // 2. Se realiza el login automático del usuario recién creado -> payload genera un token de autenticación si las credenciales son correctas.
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        }
      });

      if (!data.token) {                            // 3. Si el login falla, se retorna un error.
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        })
      }

      const cookies = await getCookies();           // 4. Si se recibe el token correctamente, se guarda en una cookie HTTP-only
      cookies.set({
        name: AUTH_COOKIE,
        value: data.token,
        httpOnly: true,
        path: "/",
        //TODO: Ensure cross-domain cookie sharing
      })
    }),

  login: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        }
      });

      if(!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        })
      }

      const cookies = await getCookies();
      cookies.set({
        name: AUTH_COOKIE,
        value: data.token,
        httpOnly: true,
        path: "/",
        //TODO: Ensure cross-domain cookie sharing
      })

      return data
    }),

  logout: baseProcedure.mutation(async () => {
    const cookies = await getCookies();
    cookies.delete(AUTH_COOKIE);
  })

})