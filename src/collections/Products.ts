import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
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
    }
  ]
}
