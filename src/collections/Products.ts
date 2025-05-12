import { isSuperAdmin } from '@/lib/access';
import { Tenant } from '@/payload-types';
import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: ({ req }) => {
      if(isSuperAdmin(req.user)) return true;                    // Solo un super-admin puede crear productos

      const tenant = req.user?.tenants?.[0]?.tenant as Tenant;   // Si no es Super Admin, obtener el 'tenant' (tienda) asociado al usuario
      
      return Boolean(tenant?.stripeDetailsSubmitted)             // Permitir la creación solo si el 'tenant' ha enviado sus detalles de Stripe (TODO)
    }
  },
  admin: {
    useAsTitle: 'name',  // Solo un super-admin puede leer el campo  'name' de cada producto, los usuarios normales no ->  
  },                     // Cuando se crea una order el usuario no podra leer en name del producto en el dashboard (untitled) pero si el super-admin
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "text",
    },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD"
      }
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refund"],
      defaultValue: "30-day",
    },
    {
      name: "content",
      type: "textarea",
      admin: {
        description: "Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materials. Supports Markdown formatting"
      }
    }
  ]
}
