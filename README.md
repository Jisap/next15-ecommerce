# Next15 E-commerce

E-commerce multi-tenant construido con Next.js 15, Payload CMS y TypeScript.

## Tabla de Contenidos

- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Convenciones](#convenciones)
- [Licencia](#licencia)

---

## Características

- Multi-tenant: Soporta múltiples tiendas (tenants) en una sola plataforma.
- Gestión de productos, categorías, etiquetas y reseñas.
- Checkout y órdenes de compra.
- API modularizada con procedimientos para cada dominio.
- Tipado estricto con TypeScript y validaciones con Zod.
- Arquitectura escalable y mantenible.

---

## Estructura del Proyecto

```
.
├── src/
│   ├── app/                # Entrypoint de la app Next.js
│   ├── modules/            # Módulos de dominio (products, reviews, checkout, etc.)
│   ├── collections/        # Definiciones de colecciones Payload CMS
│   ├── lib/                # Utilidades y helpers
│   ├── constants.ts        # Constantes globales
│   ├── payload-types.ts    # Tipos generados de Payload CMS
│   └── seed.ts             # Script para poblar la base de datos
├── public/                 # Archivos estáticos
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Módulos Principales

### Products (`src/modules/products`)
- **Procedures:** Endpoints para obtener productos individuales o múltiples, filtrado por categoría, precio, etiquetas y tenant.
- **Lógica de reviews:** Calcula promedio de ratings y distribución de estrellas.
- **Tipado:** Tipos estrictos para productos y parámetros de búsqueda.

### Reviews (`src/modules/reviews`)
- **Procedures:** Endpoints para crear y listar reseñas de productos.
- **Tipado:** Tipos para reseñas y validaciones.

### Checkout (`src/modules/checkout`)
- **Procedures:** Lógica de compra y procesamiento de órdenes.
- **Hooks/UI/Store:** Componentes y lógica de frontend para el proceso de checkout.

### Tenants, Categories, Tags, Auth, Home
- Módulos adicionales para gestión de tiendas, categorías, etiquetas, autenticación y página principal.

---

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <repo-url>
   cd next15-ecommerce
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura variables de entorno según tu base de datos y Payload CMS.
4. Ejecuta la app:
   ```bash
   npm run dev
   ```

---

## Scripts Disponibles

- `npm run dev` — Inicia el servidor de desarrollo.
- `npm run build` — Compila la aplicación para producción.
- `npm run start` — Inicia la app en modo producción.
- `npm run seed` — Pobla la base de datos con datos de ejemplo.

---

## Convenciones

- **TypeScript** para todo el código.
- **Zod** para validaciones de entrada/salida.
- **TRPC** para procedimientos y endpoints.
- **Payload CMS** como backend headless.

---

## Licencia

MIT
