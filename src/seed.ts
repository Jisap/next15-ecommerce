import { getPayload } from "payload"
import config from "@payload-config"
import { stripe } from "./lib/stripe";

// He tenido que modificar el proceso de seeding porque el script no me funcionaba.
// Para ello he tenido que instalar dotenv-cli y tsx.
// tsx Ejecuta directamente tu archivo TypeScript (src/seed.ts), manejando la compilación y la ejecución en un entorno de Módulos ES ("type": "module") de forma sencilla. También resuelve los alias de ruta (como @payload-config) definidos en tu tsconfig.json.
// dotenv-cli Carga las variables de entorno definidas en tu archivo .env (como PAYLOAD_SECRET y la conexión a la base de datos) y las hace disponibles para el proceso que ejecuta a continuación.


const categories = [
  {
    name: "All",
    slug: "all",
  },
  {
    name: "Business & Money",
    color: "#FFB347",
    slug: "business-money",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      {
        name: "Entrepreneurship",
        slug: "entrepreneurship",
      },
      { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
      { name: "Investing", slug: "investing" },
      { name: "Management & Leadership", slug: "management-leadership" },
      {
        name: "Marketing & Sales",
        slug: "marketing-sales",
      },
      { name: "Networking, Careers & Jobs", slug: "networking-careers-jobs" },
      { name: "Personal Finance", slug: "personal-finance" },
      { name: "Real Estate", slug: "real-estate" },
    ],
  },
  {
    name: "Software Development",
    color: "#7EC8E3",
    slug: "software-development",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Programming Languages", slug: "programming-languages" },
      { name: "DevOps", slug: "devops" },
    ],
  },
  {
    name: "Writing & Publishing",
    color: "#D8B5FF",
    slug: "writing-publishing",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Blogging", slug: "blogging" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Self-Publishing", slug: "self-publishing" },
    ],
  },
  {
    name: "Other",
    slug: "other",
  },
  {
    name: "Education",
    color: "#FFE066",
    slug: "education",
    subcategories: [
      { name: "Online Courses", slug: "online-courses" },
      { name: "Tutoring", slug: "tutoring" },
      { name: "Test Preparation", slug: "test-preparation" },
      { name: "Language Learning", slug: "language-learning" },
    ],
  },
  {
    name: "Self Improvement",
    color: "#96E6B3",
    slug: "self-improvement",
    subcategories: [
      { name: "Productivity", slug: "productivity" },
      { name: "Personal Development", slug: "personal-development" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Career Growth", slug: "career-growth" },
    ],
  },
  {
    name: "Fitness & Health",
    color: "#FF9AA2",
    slug: "fitness-health",
    subcategories: [
      { name: "Workout Plans", slug: "workout-plans" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Mental Health", slug: "mental-health" },
      { name: "Yoga", slug: "yoga" },
    ],
  },
  {
    name: "Design",
    color: "#B5B9FF",
    slug: "design",
    subcategories: [
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "3D Modeling", slug: "3d-modeling" },
      { name: "Typography", slug: "typography" },
    ],
  },
  {
    name: "Drawing & Painting",
    color: "#FFCAB0",
    slug: "drawing-painting",
    subcategories: [
      { name: "Watercolor", slug: "watercolor" },
      { name: "Acrylic", slug: "acrylic" },
      { name: "Oil", slug: "oil" },
      { name: "Pastel", slug: "pastel" },
      { name: "Charcoal", slug: "charcoal" },
    ],
  },
  {
    name: "Music",
    color: "#FFD700",
    slug: "music",
    subcategories: [
      { name: "Songwriting", slug: "songwriting" },
      { name: "Music Production", slug: "music-production" },
      { name: "Music Theory", slug: "music-theory" },
      { name: "Music History", slug: "music-history" },
    ],
  },
  {
    name: "Photography",
    color: "#FF6B6B",
    slug: "photography",
    subcategories: [
      { name: "Portrait", slug: "portrait" },
      { name: "Landscape", slug: "landscape" },
      { name: "Street Photography", slug: "street-photography" },
      { name: "Nature", slug: "nature" },
      { name: "Macro", slug: "macro" },
    ],
  },
]

const seed = async () => {

  const payload = await getPayload({ config });

  const adminAccount = await stripe.accounts.create({}); // Nueva cuenta de Stripe para el admin



  // --- Limpieza de usuarios "super-admin" ---
  try {
    console.log('Deleting users with role "super-admin"...');
    const nativeDb = payload.db.connection.db;
    if (nativeDb) {
      const usersCollection = nativeDb.collection(payload.collections.users.config.slug!);
      const result = await usersCollection.deleteMany({ roles: "super-admin" });
      console.log(`Deleted ${result.deletedCount} super-admin user(s).`);
    } else {
      console.warn('Could not get native DB connection to delete super-admin users.');
    }
  } catch (error: any) {
    console.error('Error deleting super-admin users:', error);
    throw error;
  }
  // --- Fin limpieza ---

  // --- Limpieza de la colección 'tenants' ---
  try {
    console.log('Dropping existing tenants collection...');
    const nativeDb = payload.db.connection.db;
    if (nativeDb) {
      const collectionSlug = payload.collections.tenants.config.slug!;
      await nativeDb.dropCollection(collectionSlug);
      console.log('Tenants collection dropped successfully.');
    } else {
      console.warn('Could not get native DB connection to drop tenants collection.');
    }
  } catch (error: any) {
    if (error.code === 26 || error.message.includes('ns not found')) {
      console.log('Tenants collection did not exist, skipping drop.');
    } else {
      console.error('Error dropping tenants collection:', error);
      throw error;
    }
  }
  // --- Fin limpieza ---

  // Create admin tenant
  const adminTenant = await payload.create({
    collection: "tenants",
    data: {
      name: "admin",
      slug: "admin",
      stripeAccountId: adminAccount.id, // Se asigna el ID de la cuenta de Stripe del admin 
    }
  })

  // Create admin user
  await payload.create({
    collection: "users",
    data: {
      email: "admin@demo.com",
      password: "demo",
      roles: ["super-admin"],
      username: "admin",
      tenants: [
        {
          tenant: adminTenant.id,
        }
      ]
    }
  })

  // --- Inicio del bloque para limpiar la colección 'categories' ---
  try {
    // 1. Intenta eliminar la colección 'categories' existente antes de sembrar datos nuevos.
    //    Esto previene errores si el script se ejecuta varias veces o si
    //    la colección quedó en un estado inconsistente de una ejecución anterior.

    console.log('Dropping existing categories collection...');

    // 2. Accede al objeto de conexión nativo de la base de datos MongoDB.
    //    Payload abstrae la base de datos, pero a veces necesitamos la conexión
    //    directa para operaciones específicas como 'dropCollection'.
    const nativeDb = payload.db.connection.db;

    // 3. Comprueba si la conexión nativa a la BD está disponible.
    //    Es una buena práctica verificar antes de usarla.
    if (nativeDb) {
      // 4. Obtiene el nombre real (slug) de la colección 'categories' desde la configuración de Payload.
      //    Esto asegura que usamos el nombre correcto, incluso si se personaliza.
      const collectionSlug = payload.collections.categories.config.slug!; // El '!' asume que siempre tendrá slug

      // 5. Ejecuta el comando para eliminar la colección en MongoDB.
      await nativeDb.dropCollection(collectionSlug);
      console.log('Categories collection dropped successfully.');
    } else {
      // 6. Advierte si no se pudo obtener la conexión nativa.
      console.warn('Could not get native DB connection to drop collection.');
    }
  } catch (error: any) {
    // 7. Captura cualquier error que ocurra durante el intento de eliminación.

    // 8. Comprueba específicamente si el error es porque la colección no existía.
    //    MongoDB devuelve el código 26 ('NamespaceNotFound') en este caso.
    //    Si la colección no existía, no es un error real para nosotros,
    //    simplemente significa que no había nada que eliminar.
    if (error.code === 26 || error.message.includes('ns not found')) {
      console.log('Categories collection did not exist, skipping drop.');
    } else {
      // 9. Si es cualquier otro error (problema de permisos, de conexión, etc.),
      //    lo muestra en consola y lo vuelve a lanzar para detener el script,
      //    ya que es un problema inesperado que debe ser investigado.
      console.error('Error dropping categories collection:', error);
      throw error; // Detiene la ejecución del script si el error no es esperado
    }
  }
  // --- Fin del bloque de limpieza ---

  console.log('Seeding categories...');
  for (const category of categories) {
    const parentCategory = await payload.create({
      collection: "categories",
      data: {
        name: category.name,
        slug: category.slug,
        color: category.color,
        parent: null,
      }
    });

    for (const subCategory of category.subcategories || []) {
      await payload.create({
        collection: "categories",
        data: {
          name: subCategory.name,
          slug: subCategory.slug,
          parent: parentCategory.id,
        }
      });
    }
  }
}

try {
  await seed();
  console.log('Seeding completed successfully.');
  process.exit(0);
} catch (error) {
  console.error('Seeding failed:', error);
  process.exit(1);
}
