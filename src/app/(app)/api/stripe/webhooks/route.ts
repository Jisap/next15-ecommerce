import { getPayload } from "payload";
import type { Stripe } from "stripe";
import config from "@payload-config";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ExpandedLineItem } from "@/modules/checkout/types";


export async function POST(req: Request) {                                           // Endpoint para manejar los webhooks de Stripe
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(                                          // Verifica la firma del webhook para asegurar que la petición proviene de Stripe
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  
  } catch (error) {                                                                  // Manejo de errores durante la verificación de la firma
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if(error! instanceof Error){
      console.log(error);
    }

    console.log(`❌ Error message: ${errorMessage}`);

    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  console.log("✔ Success, Webhook recibido con éxito:", event.id)

  const permittedEvents: string[] = [                                                // Lista de eventos de Stripe que este webhook manejará
    "checkout.session.completed",
    "account.updated",
  ]

  const payload = await getPayload({ config })                                       // Inicializa Payload CMS para interactuar con la base de datos

  if (permittedEvents.includes(event.type)) {                                        // Procesa el evento solo si está en la lista de permitidos
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":                                           // Evento: Sesión de checkout completada -> Obtenemos la data 
          data = event.data.object as Stripe.Checkout.Session;

          // Verificamos que data-metadata no sea null o undefined y que el userId sea de tipo string
          if (!data.metadata || typeof data.metadata.userId !== 'string') {
            console.error("Webhook Error: userId is missing or not a string in checkout session metadata.", { metadata: data.metadata });
            throw new Error("User Id is missing or not a string in checkout session metadata");
          }

          const user = await payload.findByID({                                       // Obtenemos el usuario asociado a la metadata del evento
            collection: "users",
            id: data.metadata.userId,      
          });

          if(!user){
            throw new Error("User not found")
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(            // Recupera la sesión de checkout expandiendo los line_items para obtener detalles del producto   
            data.id,                                                                      // data.id es el id de la session de checkout que se completo
            { expand: ["line_items.data.price.product"] },                                // metadatos de los productos que se compraron
            { stripeAccount: event.account }                                              // contiene el id de la cuenta conectada de stripe (stripeAccountId del tenant para el que se completo el pago)
          )

          if(
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ){
            throw new Error("No line items found")
          }

          const lineItems = expandedSession.line_items.data as ExpandedLineItem[]      // Asegura que los line_items son del tipo esperado (con metadatos del producto)

          for (const item of lineItems) {                                              // Itera sobre cada artículo comprado para crear un registro de pedido en payload
            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account,
                user: user.id,
                product: item.price.product.metadata.id,
                name: item.price.product.name,
              }
            })
          }

          break;

        case "account.updated":
          data = event.data.object as Stripe.Account;

          const updateResult = await payload.update({
            collection: "tenants",
            where: {
              stripeAccountId: {
                equals: data.id
              },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted
            }
          });
         
          break;

        default:
          throw new Error(`Unhandled event: ${event.type}`)                          // Maneja cualquier evento no esperado que haya pasado el filtro inicial
      }

    } catch (error) {
      console.log(error)
      return NextResponse.json(                                                      // Responde con error si el manejo del evento falla
        { message: `Webhook handler failed` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(                                                          // Responde con éxito si el evento fue recibido (incluso si no fue procesado por no estar en permittedEvents)
    { message: "Received" },
    { status: 200 },
  );
}






