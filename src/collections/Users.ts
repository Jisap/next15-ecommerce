import type { CollectionConfig } from 'payload'
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import { isSuperAdmin } from '@/lib/access'


// En una colección de Payload, Payload automáticamente te agrega todos los campos necesarios para manejar la autenticación
// como email (como identificador de login), password(se guarda hasheada), timestamps(createdAt, updatedAt), resetPasswordToken, verifyEmailToken, etc.
// Aqui solo definimos los campos que queremos que aparezcan en la interfaz de usuario de Payload


const defaultTenantsArrayField = tenantsArrayField({  // Crea una configuración un campo tipo "multi-tenant"
  tenantsArrayFieldName: "tenants",                   // Nombre del campo que se añadirá la colleción Users
  tenantsCollectionSlug: "tenants",                   // Le dice a la función tenantArrayField que colección contiene los datos de los tenants
  tenantsArrayTenantFieldName: "tenant",              // Nombre del campo que se añadirá a cada elemento del campo "tenants"
  arrayFieldAccess: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },
  tenantFieldAccess: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },
})


export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req, id }) => {
      if (isSuperAdmin(req.user)) return true;

      return req.user?.id === id
    },
  },
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => !isSuperAdmin(user),          // El boton de crear nuevo usuario estará oculto para los usuarios que no sean superadmin
  },
  auth: {                                                    // ← esto activa la autenticación y el manejo de tokens
    cookies: {
      ...(process.env.NODE_ENV !== "development" && {
        sameSite: "None",
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        secure: true,
      }),
    }
  },                                           
  fields: [
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
    {
      admin: {
        position: "sidebar"                             // Le dice a Payload que coloque este campo "roles" en la barra lateral (sidebar) de la pantalla de edición de usuarios, en lugar de en el área principal del formulario. 
      },
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,                                    // Un mismo usuario puede tener múltiples roles
      options: ["super-admin", "user"],
      access: {
        update: ({ req }) => isSuperAdmin(req.user),    // Solo los superadmins pueden actualizar los roles
      },
    },
    {
      ...defaultTenantsArrayField,                      // Spread de la configuración del campo "tenants"
      admin: {                                          // En el panel de administración de Payload,
        ...(defaultTenantsArrayField?.admin || {}),     // se intenta acceder a la prop admin y si no existe devuelve undefined
        position: "sidebar"                      
      }
    }
  ],
}

