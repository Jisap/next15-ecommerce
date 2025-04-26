import type { CollectionConfig } from 'payload';

// Categoría "Electrónica":
// - id: 1
// - name: "Electrónica"
// - parent: null(no tiene padre)

// Categoría "Computadoras":
// - id: 2
// - name: "Computadoras"
// - parent: 1(referencia al ID de "Electrónica")

// Categoría "Laptops":
// - id: 3
// - name: "Laptops"
// - parent: 2(referencia al ID de "Computadoras")

// Resultado de consultar la categoría "Electrónica" (nivel 1)
// {
//   id: 1,
//     name: "Electrónica",
//     slug: "electronica",
//     parent: null,
//       subcategories: [
//         {
//           id: 2,
//           name: "Computadoras",
//           slug: "computadoras",
//           parent: 1, // Referencia a Electrónica       // Por defecto, las subcategorías del siguiente nivel no están incluidas      
//          }
//        ]
// }


export const Categories: CollectionConfig = {

  slug: 'categories',
  admin:{
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "color",
      type: "text",
    },
    {
      name: "parent",               // El campo "parent" permite establecer una relación jerárquica "de abajo hacia arriba" 
      type: "relationship",         // (una categoría apunta a su categoría padre),
      relationTo: "categories",     // Establece una relación con la misma colección "categories".
      hasMany: false,               // Indica que una categoría solo puede tener un padre.  
    },
    {
      name: "subcategories",        // El campo "subcategories" usará la información del campo "parent" para encontrar  
      type: "join",                 // todas las categorías que tienen como padre la categoría actual. 
      collection: "categories",     // Indica que se relaciona con la misma colección.
      on: "parent",                 // Especifica que esta relación se basa en el campo "parent".
      hasMany: true,                // Permite múltiples subcategorías para una categoría
    }
  ]
}

