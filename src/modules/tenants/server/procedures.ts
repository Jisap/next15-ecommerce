
import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const tenantsRouter = createTRPCRouter({         // tenantsRouter define un endpoit getOne
  getOne: baseProcedure                                 // que permite a los clientes solicitar un tenant a la bd
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {               
      const tenantsData = await ctx.db.find({
        collection: 'tenants',
        depth: 1,  // tenant.image is a type of "Media" and we want to populate it
        where: {
          slug: {
            equals: input.slug
          },
        },
        limit: 1,
        pagination: false,
      });

      const tenant = tenantsData.docs[0];
      if(!tenant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant not found' });
  
      return tenant as Tenant & { image: Media | null }; // tenant es de tipo Tenant pero además su propiedad image es de tipo Media
    
  })
})