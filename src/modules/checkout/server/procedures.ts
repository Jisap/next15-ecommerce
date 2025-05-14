
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/app/trpc/init";
import { Media, Tenant } from "@/payload-types";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { CheckoutMetadata, ProductMetadata } from "../types";
import { stripe } from "@/lib/stripe";
import { PLATFORM_FEE_PERCENTAGE } from "@/constants";


export const checkoutRouter = createTRPCRouter({

  verify: protectedProcedure
    .mutation(async({ ctx }) => {
      const user = await ctx.db.findByID({
        collection: "users",
        id: ctx.session.user.id, 
        depth: 0, // user.tenants[0].tenant Al ser depth:0 no se recupera el documento entero sino solo el ID de ese documento
      })

      if(!user){
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const tenantId = user.tenants?.[0]?.tenant as string;
      
      const tenant = await ctx.db.findByID({
        collection: "tenants",
        id: tenantId
      });

      if(!tenant){
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      const accountLink = await stripe.accountLinks.create({
        account: tenant.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`,
        type: "account_onboarding",
      });

      if(!accountLink){
        throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to create verification link" });
      }

      return { url: accountLink.url }                                // Sirve para que el tenant (vendedor) configure y verifique su cuenta de Stripe para poder operar en el marketplace (vender productos y recibir pagos).
    }),
  
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

      const tenantsData = await ctx.db.find({                         // Inicia una búsqueda en la base de datos utilizando el cliente de Payload (ctx.db).
        collection: "tenants",                                        // Especifica que la búsqueda se realizará en la colección "tenants". 
        limit: 1,                                                     // Limita el número de documentos devueltos a 1, ya que se espera encontrar como máximo un tenant con un slug específico.
        pagination: false,                                            // Desactiva la paginación para esta consulta, ya que solo se necesita el primer resultado.
        where: {                                                      // Define las condiciones para la búsqueda.
          slug: {                                                     // Filtra los documentos por el campo "slug".
            equals: input.tenantSlug                                  // Busca un tenant cuyo "slug" sea igual al valor de input.tenantSlug (el slug proporcionado en la entrada del procedimiento).                               
          }
        }
      })

      const tenant = tenantsData.docs[0];                             // Accede al primer documento (y se asume que único) del array 'docs' devuelto por la consulta.     

      if(!tenant){
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant not found" });
      }

      if(!tenant.stripeDetailsSubmitted){
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant no allowed to sell products" });
      }

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
        }));

      const totalAmount = products.docs.reduce(
        (acc, item) => acc + item.price * 100,
        0
      );

      const platformFeeAmount = Math.round(
        totalAmount * PLATFORM_FEE_PERCENTAGE / 100
      )

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
        } as CheckoutMetadata,
        payment_intent_data: {
          application_fee_amount: platformFeeAmount
        }
      },{
        stripeAccount: tenant.stripeAccountId,
      });

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