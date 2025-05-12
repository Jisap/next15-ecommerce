import { isSuperAdmin } from '@/lib/access'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    hidden: ({ user }) => !user?.isSuperAdmin,          // El boton de crear nueva media estará oculto para los usuarios que no sean superadmin
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}


