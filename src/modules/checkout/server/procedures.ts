
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { CheckoutMetadata, ProductMetadata } from "../types";
import { stripe } from "@/lib/stripe";


export const checkoutRouter = createTRPCRouter({
  
  purchase: protectedProcedure                                       // Procedimiento 'purchase': maneja la lógica de compra de productos.
    .input (
      z.object({
        productIds: z.array(z.string()).min(1),                      // Se le pasan los ids de los productos que se van a comprar
        tenantSlug: z.string().min(1),                               // Se le pasa el slug del tenant al que se van a comprar
      })
    )
    .mutation(async({ ctx, input }) => {                             // Define la lógica de la compra de productos. Recibe el ctx de trpc que incluye la instancia de payload y la session
      const products = await ctx.db.find({
        collection: "products",                                      // Se busca en la colección "products"
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds,                                // los productos cuya id este en la lista de productos a comprar (input.productIds)
              }
            },
            {
              "tenant.slug": {                                       // y cuyo tenantSlug coincida con el de la lista de compra (input.tenantSlug)
                equals: input.tenantSlug
              }
            }
          ]
        }
      })

      if(products.totalDocs !== input.productIds.length){
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const tenantsData = await ctx.db.find({                         // Se buscan los datos del tenant
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          slug: {
            equals: input.tenantSlug
          }
        }
      })

      const tenant = tenantsData.docs[0];

      if(!tenant){
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant not found" });
      }

      // TODO: throw error if stripe details are not submitted

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =       // Se preparán los "line items" para la session de checkout de Stripe. Cada "line item" representa un producto en el carrito de Stripe.
        products.docs.map((product) => ({                                     // Se mapea cada producto a un objeto de lineItem de Stripe
          quantity: 1,
          price_data: {
            unit_amount: product.price * 100,
            currency: "usd",
            product_data: {
              name: product.name,
              metadata: {
                stripeAccountId: tenant.stripeAccountId,
                id: product.id,
                name: product.name,
                price: product.price
              } as ProductMetadata
            }
          }
        }))

      const checkout = await stripe.checkout.sessions.create({                  // Se crea la session de checkout en Stripe
        customer_email: ctx.session.user.email,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${input.tenantSlug}/checkout?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${input.tenantSlug}/checkout?cancel=true`,
        mode: "payment",
        line_items: lineItems,
        invoice_creation: {
          enabled: true,
        },
        metadata: {
          userId: ctx.session.user.id
        } as CheckoutMetadata
      })

      // Se verifica si Stripe devolvió una URL de checkout.
      if(!checkout.url){
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create checkout" });
      }

      // Se devuelve la URL de checkout que el frontend usará para redireccionar al usuario. a la página de pago de Stripe
      return { url: checkout.url }
    })
    ,

  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {               
      
      const data = await ctx.db.find({                              // Realiza la consulta final para obtener los productos filtrados
        collection: "products",                                     // Se busca en la colección "products"
        depth: 2,                                                   // populate de "category", "image" & "tenant" & "tenant.image"
        where: {                                                  
          id: {
            in: input.ids
          }
        },
      });

      if(data.totalDocs !== input.ids.length){
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const totalPrice = data.docs.reduce((acc, product) => {       // Calcula el total de precio de los productos
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price)
      }, 0)
  
      return {
        ...data,
        totalPrice: totalPrice,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,                         // Aseguramos que la propiedad image sea de tipo Media
          tenant: doc.tenant as Tenant & { image: Media | null },   // Aseguramos que la propiedad tenant sea de tipo Tenant
          
        }))
      }
    


  })
})