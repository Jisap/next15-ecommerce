import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true, // ← esto activa la autenticación y el manejo de tokens
  fields: [
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
  ],
}

