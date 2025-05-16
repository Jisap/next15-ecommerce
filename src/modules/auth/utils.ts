

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
    // sameSite: "none",                                                     // This breaks the login flow (debug in chapter 31)
    // domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    // secure: process.env.NODE_ENV === "production",
  })

}