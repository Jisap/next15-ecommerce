import type { CollectionConfig } from 'payload'
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'


// En una colección de Payload, Payload automáticamente te agrega todos los campos necesarios para manejar la autenticación
// como email (como identificador de login), password(se guarda hasheada), timestamps(createdAt, updatedAt), resetPasswordToken, verifyEmailToken, etc.
// Aqui solo definimos los campos que queremos que aparezcan en la interfaz de usuario de Payload


const defaultTenantsArrayField = tenantsArrayField({  // Crea una configuración un campo tipo "multi-tenant"
  tenantsArrayFieldName: "tenants",                   // Nombre del campo que se añadirá la colleción Users
  tenantsCollectionSlug: "tenants",                   // Le dice a la función tenantArrayField que colección contiene los datos de los tenants
  tenantsArrayTenantFieldName: "tenant",              // Nombre del campo que se añadirá a cada elemento del campo "tenants"
  arrayFieldAccess: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  tenantFieldAccess: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
})


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
    {
      admin: {
        position: "sidebar"                      // Le dice a Payload que coloque este campo "roles" en la barra lateral (sidebar) de la pantalla de edición de usuarios, en lugar de en el área principal del formulario. 
      },
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,                             // Un mismo usuario puede tener múltiples roles
      options: ["super-admin", "user"]
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

