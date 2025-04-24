import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders, cookies as getCookies } from "next/headers";
import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";




export const authRouter = createTRPCRouter({

  session: baseProcedure.query(async ({ ctx }) => { // Este procedimiento recibe el ctx de trpc que contiene la instancia de payload
    
    const headers = await getHeaders();                    // Obtenemos los headers de la petición, incluida la cookie

    const session = await ctx.db.auth({ headers })         // Payload usa esa cookie para verificar si el token es válido

    return session;                                        // Devuelve la sesión (null si no hay usuario autenticado, o el objeto de usuario si lo hay)
  }),

  register: baseProcedure
    // Validación del input usando Zod
    .input(registerSchema)
    .mutation( async ({ input, ctx }) => {
      
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username
          }
        }
      })

      const existingUser = existingData.docs[0]
      if(existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already exists",
        })
      }

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
    .input( loginSchema )
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