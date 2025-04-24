import type { CollectionConfig } from 'payload'

// En una colección de Payload, Payload automáticamente te agrega todos los campos necesarios para manejar la autenticación
// como email (como identificador de login), password(se guarda hasheada), timestamps(createdAt, updatedAt), resetPasswordToken, verifyEmailToken, etc.
// Aqui solo definimos los campos que queremos que aparezcan en la interfaz de usuario de Payload

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

