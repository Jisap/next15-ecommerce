import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import { loginSchema, registerSchema } from "../schemas";
import { generateAuthCookie } from "../utils";




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

      const existingUser = existingData.docs[0]     // Se verifica si el usuario ya existe
      if(existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already exists",
        })
      }

      const tenant = await ctx.db.create({          // Se crea un nuevo tenant
        collection: "tenants",
        data: {
          name: input.username,
          slug: input.username,
          stripeAccountId: "test"
        }
      })


      await ctx.db.create({                         // 1. Se crea un nuevo usuario en la colección 'users' 
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
          username: input.username,
          tenants: [
            {
              tenant: tenant.id,                    // Se añade el tenant al usuario
            }
          ]
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


      await generateAuthCookie({                    // 4. Inicializamos el objeto cookies
        prefix: ctx.db.config.cookiePrefix,         // Si se recibe el token correctamente, se guarda en una cookie HTTP-only
        value: data.token,
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

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      })

      return data
    }),

  
})