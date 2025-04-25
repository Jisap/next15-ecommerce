

import { cookies as getCookies } from "next/headers";

interface Props {
  prefix: string;
  value: string;
}

export const generateAuthCookie = async ({ prefix, value }: Props) => {
  const cookies = await getCookies();                                        // Inicializamos el objeto cookies
  cookies.set({                                                              // Si se recibe el token correctamente, se guarda en una cookie HTTP-only
    name: `${prefix}-token`,                                                 // by default prefix is "payload"
    value: value,
    httpOnly: true,
    path: "/",
  })

}