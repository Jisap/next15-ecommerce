// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

// Sino te funcionan las importaciones de las colecciones y por tanto no se puede generar el tipo de los datos con "npm run generate:types"
// 1º Modifica el package.json y añade "type": "module"
// 2º Modifica el tsconfig.json y añade "module": "esnext"
// 3º Modifica el tsconfig.json y añade "moduleResolution": "bundler"

import  { Users }  from './collections/Users'
import  { Media } from './collections/Media'
import  { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Tags } from './collections/Tags'
import { Tenants } from './collections/Tenants'
import { Orders } from './collections/Orders'
import { Reviews } from './collections/Reviews'
import { isSuperAdmin } from './lib/access'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Products, Tags, Tenants, Orders, Reviews],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    multiTenantPlugin({                // Especifica qué colecciones dependen de un 'tenant' (inquilino/tienda) (ejecutar "npx payload generate:importmap" para actualizar los componentes asociados) 
      collections: {
        products: {},                  // Los productos pertenecen a tenants específicos (tiendas)  
      },
      tenantsArrayField: {             // Configura cómo se vinculan los usuarios a los tenants              
        includeDefaultField: false,    // No añadir automáticamente un campo 'tenants' a la colección Users
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user) // Define quién tiene acceso a TODOS los tenants
    })
    // storage-adapter-placeholder
  ],
})
