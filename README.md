# Next15 E-commerce

Proyecto de e-commerce multi-tenant construido con Next.js 15, Payload CMS, TRPC, TypeScript y Zod.

---

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías Clave](#tecnologías-clave)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Convenciones](#convenciones)

---

## Características

- **Multi-tenant:** Soporte nativo para múltiples tiendas (tenants) operando de forma independiente en una única instancia de la aplicación. Cada tenant puede tener sus propios productos, categorías, pedidos, etc.
- **Gestión Integral de E-commerce:** Administración completa de productos (con variantes, precios, inventario), categorías, etiquetas, y reseñas de clientes.
- **Proceso de Compra Completo:** Funcionalidad de carrito de compras persistente, proceso de checkout optimizado y gestión de órdenes de compra.
- **API Robusta y Modular con TRPC:** API construida con TRPC, ofreciendo procedimientos específicos y type-safe para cada dominio del negocio (productos, usuarios, pedidos), facilitando la integración y el desarrollo frontend.
- **Seguridad y Fiabilidad con TypeScript y Zod:** Tipado estricto en todo el codebase gracias a TypeScript y validaciones de datos robustas con Zod para las entradas/salidas de la API y formularios, minimizando errores en tiempo de ejecución.
- **Arquitectura Moderna y Escalable:** Diseñada para ser escalable y fácil de mantener, utilizando Next.js 15 para el frontend y funcionalidades de backend, junto con Payload CMS como un potente backend headless.
- **Población de Datos Inicial (Seeding):** Incluye un script para poblar la base de datos con datos de ejemplo, agilizando el desarrollo y las pruebas iniciales.

---

## Tecnologías Clave

Este proyecto se basa en un stack moderno y eficiente para ofrecer una experiencia de e-commerce robusta y escalable:

- **Framework Principal:** **[Next.js 15](https://nextjs.org/)** (utilizando React) para el desarrollo tanto del frontend como del backend (API routes/TRPC). Proporciona renderizado del lado del servidor (SSR), generación de sitios estáticos (SSG), y una excelente experiencia de desarrollo.
- **CMS Headless:** **[Payload CMS](https://payloadcms.com/)** actúa como el sistema de gestión de contenido y backend de datos. Ofrece una interfaz de administración personalizable y una potente API para gestionar productos, tenants, usuarios, colecciones, etc.
- **Lenguaje de Programación:** **[TypeScript](https://www.typescriptlang.org/)** se utiliza en todo el proyecto para añadir tipado estático al JavaScript, mejorando la calidad del código, la mantenibilidad y la detección temprana de errores.
- **Validación de Datos:** **[Zod](https://zod.dev/)** para la declaración y validación de esquemas de datos, asegurando que los datos que fluyen a través de la aplicación (API, formularios) sean correctos y seguros.
- **Construcción de APIs:** **[TRPC](https://trpc.io/)** para crear APIs end-to-end typesafe sin necesidad de generación de esquemas ni clientes. Facilita enormemente la comunicación entre el frontend Next.js y los procedimientos del backend.

---

## Estructura del Proyecto

```
.
├── src/                    # Código fuente principal de la aplicación
│   ├── app/                # Rutas y layouts de la aplicación Next.js (App Router)
│   ├── modules/            # Módulos de dominio (products, reviews, checkout, tenants, auth, etc.)
│   │   └── [domain]/       # Cada módulo contiene lógica de negocio, procedures TRPC, tipos, etc.
│   ├── collections/        # Definiciones de las colecciones para Payload CMS
│   ├── lib/                # Utilidades compartidas, helpers, y configuraciones (ej: cliente TRPC)
│   ├── constants.ts        # Constantes globales de la aplicación
│   ├── payload-types.ts    # Tipos generados automáticamente por Payload CMS para un tipado seguro
│   └── seed.ts             # Script para poblar la base de datos con datos iniciales de ejemplo
├── public/                 # Archivos estáticos (imágenes, fuentes, etc.)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Módulos Principales
Cada módulo en `src/modules` encapsula la lógica de un dominio específico del negocio.

### Products (`src/modules/products`)
- **Responsabilidad:** Gestión completa del catálogo de productos.
- **Funcionalidades:**
    - Creación, lectura, actualización y eliminación (CRUD) de productos.
    - Filtrado avanzado por categoría, precio, etiquetas, tenant, y otros atributos.
    - Gestión de inventario (si aplica).
    - Cálculo de promedio de ratings y distribución de estrellas basado en las reseñas asociadas.
- **Procedures TRPC:** Endpoints para interactuar con los datos de productos (ej: `getProductById`, `listProducts`).
- **Tipado:** Definiciones estrictas en TypeScript para la entidad `Product` y parámetros de API, validadas con Zod.

### Reviews (`src/modules/reviews`)
- **Responsabilidad:** Gestión de las reseñas y calificaciones de los productos por parte de los usuarios.
- **Funcionalidades:**
    - Creación de nuevas reseñas para productos específicos.
    - Listado y paginación de reseñas por producto.
    - Validación de los datos de las reseñas (rating, comentario).
- **Procedures TRPC:** Endpoints para la creación (`createReview`) y consulta (`getReviewsByProduct`) de reseñas.
- **Tipado:** Tipos específicos para la entidad `Review` y sus validaciones con Zod.

### Checkout (`src/modules/checkout`)
- **Responsabilidad:** Orquestar el proceso de finalización de compra y creación de órdenes.
- **Funcionalidades:**
    - Gestión del carrito de compras (añadir, eliminar, actualizar cantidades).
    - Recopilación de información de envío y facturación.
    - Integración con pasarelas de pago (lógica placeholder o real).
    - Creación y procesamiento de órdenes de compra en el sistema.
- **Componentes Frontend:** Incluye hooks personalizados, componentes de UI reutilizables y lógica de estado (ej: Zustand, Context API) para la experiencia de usuario durante el checkout.
- **Procedures TRPC:** Endpoints para manejar la lógica de backend del checkout, como `createOrder`, `processPayment`.

### Tenants (`src/modules/tenants`)
- **Responsabilidad:** Gestión de las diferentes tiendas (tenants) que operan en la plataforma.
- **Funcionalidades:** Creación, configuración y administración de tenants. Asegura el aislamiento de datos entre tenants (productos, pedidos, clientes, etc.).
- **Procedures TRPC:** Endpoints para la administración de tenants.

### Categories (`src/modules/categories`)
- **Responsabilidad:** Organización y clasificación de productos.
- **Funcionalidades:** Creación, edición y eliminación de categorías. Permite la asignación de productos a una o varias categorías.
- **Uso:** Facilita la navegación y el filtrado de productos en la tienda.

### Tags (`src/modules/tags`)
- **Responsabilidad:** Etiquetado y clasificación detallada de productos.
- **Funcionalidades:** Creación, edición y eliminación de etiquetas. Permite asociar múltiples etiquetas a los productos.
- **Uso:** Mejora la búsqueda de productos y permite crear colecciones temáticas o promocionales.

### Auth (`src/modules/auth`)
- **Responsabilidad:** Gestión de la autenticación y autorización de usuarios (clientes y administradores).
- **Funcionalidades:** Registro de nuevos usuarios, inicio y cierre de sesión, recuperación de contraseñas. Potencialmente, gestión de roles y permisos.
- **Integración:** Se integra con Payload CMS para la gestión de usuarios y sus credenciales.

### Home (`src/modules/home`)
- **Responsabilidad:** Lógica y presentación de la página principal de cada tenant.
- **Funcionalidades:** Muestra contenido destacado como nuevos productos, ofertas especiales, banners promocionales, etc.
- **Personalización:** Puede ser personalizable por tenant o mostrar contenido general.

---

## Instalación

**Prerrequisitos:**
- Node.js (se recomienda la última versión LTS o superior)
- npm (v7 o superior) o Yarn

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd next15-ecommerce
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto. Puedes copiar `.env.example` (si existe) como plantilla:
   ```bash
   cp .env.example .env # Si .env.example existe
   ```
   Luego, edita `.env` y completa las variables necesarias (ej: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, etc.) según tu configuración local y de Payload CMS.
4. Ejecuta la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

---

## Scripts Disponibles

- `npm run dev` — Inicia el servidor de desarrollo de Next.js y Payload CMS (generalmente en `http://localhost:3000`).
- `npm run build` — Compila la aplicación Next.js y Payload CMS para producción.
- `npm run start` — Inicia la aplicación compilada en modo producción.
- `npm run seed` — Ejecuta el script `src/seed.ts` para poblar la base de datos con datos iniciales de ejemplo. Es útil para configurar un entorno de desarrollo rápidamente.
- `npm run generate:types` — (Si aplica) Genera los tipos de Payload CMS (`payload-types.ts`).

---

## Convenciones

- **TypeScript** para todo el código, asegurando un desarrollo robusto y mantenible.
- **Zod** para la validación de esquemas de datos en la entrada y salida de API, garantizando la integridad de los datos.
- **TRPC** para la creación de APIs type-safe, facilitando la comunicación entre el frontend y el backend sin necesidad de generar clientes o definir tipos duplicados.
- **Nombres de Archivos y Carpetas:** Generalmente en `kebab-case`. Componentes React en `PascalCase`.
- **Estilo de Código:** Se recomienda seguir las configuraciones de ESLint y Prettier del proyecto para mantener la consistencia.

## Estructura de Suspense

El proyecto implementa una estructura de Suspense para manejar correctamente la hidratación del lado del cliente y los estados de carga. Esta estructura es especialmente importante cuando se utilizan hooks del lado del cliente como `useSearchParams` o bibliotecas como `nuqs`.

### Layouts y Suspense

1. **Layout Principal** (`src/app/(app)/layout.tsx`):
```tsx
<NuqsAdapter>
  <TRPCReactProvider>
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
    <Toaster />
  </TRPCReactProvider>
</NuqsAdapter>
```

2. **Layout de Home** (`src/app/(app)/(home)/layout.tsx`):
```tsx
<HydrationBoundary state={dehydrate(queryClient)}>   
  <Suspense fallback={<SearchFiltersLoading />}>
    <SearchFilters />
  </Suspense>
  <div className="flex-1 bg-[#f4f4f0]">
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  </div>
</HydrationBoundary>
```

### Cuándo usar Suspense

El componente `Suspense` debe ser utilizado cuando:

1. Se utilizan hooks del lado del cliente que requieren Suspense:
   - `useSearchParams()`
   - `useRouter()`
   - Hooks de `nuqs`
   - Cualquier hook que maneje estado del cliente y necesite hidratación

2. Se realizan operaciones asíncronas en el cliente que necesitan un estado de carga

### Ejemplos de Uso

```tsx
// No necesita Suspense (componente estático)
const StaticPage = () => {
  return <div>Página estática</div>
}

// Necesita Suspense (usa useSearchParams)
const SearchPage = () => {
  const searchParams = useSearchParams()
  return <div>Búsqueda: {searchParams.get('q')}</div>
}
```

### Consideraciones Importantes

1. **Jerarquía de Providers**: Mantener el orden correcto de los providers es crucial:
   - `NuqsAdapter` debe estar en el nivel más alto
   - `TRPCReactProvider` debe envolver el contenido que use TRPC
   - `Suspense` debe envolver el contenido que use hooks del cliente

2. **Fallbacks**: Cada `Suspense` debe tener un fallback apropiado que se muestre durante la carga:
   - Componentes de carga específicos para cada sección
   - Estados de carga que reflejen la estructura del contenido

3. **Hidratación**: El `HydrationBoundary` de React Query debe estar correctamente posicionado para manejar el estado del servidor al cliente.

---

**Nota:** Si estás utilizando MongoDB Atlas en la capa gratuita (M0), ten en cuenta que tu clúster se pausará automáticamente después de 30 días de inactividad. Si encuentras errores de conexión al iniciar el proyecto, verifica en el panel de MongoDB Atlas que el clúster no esté en pausa y reanúdalo si es necesario. [cite: ]

## Licencia

MIT