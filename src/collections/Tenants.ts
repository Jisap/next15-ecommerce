

import type { CollectionConfig } from 'payload'



export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'slug',
  },
  auth: true, // ← esto activa la autenticación y el manejo de tokens
  fields: [
    {
      name: "name",
      required: true,
      type: "text",
      label: "Store Name",
      admin: {
        description: "This is the name of the store"
      }
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      admin: {
        description: "This is the subdomain for the store"
      }
    },
    {
      name: "stripeAccountId",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      }
    },
    {
      name: "stripeDetailsSubmitted",
      type: "checkbox",
      required: true,
      admin: {
        readOnly: true,
        description: "You cannot create products until you submit your Stripe details"
      }
    }
  ],
}
