


import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [

    // Match all path except for:
    // /api routes
    // /_next (Next.js /public)
    // /_static (inside /public)
    // all root files inside /public (favicon.ico, robots.txt, etc.)

    "/((?!api/|_next/|_static/|_vercel|media/|[\w-]+\.\w+).*)"
  ]
};


// Intercepta las peticiones antes de que lleguen a páginas o API routes
// El proposito es detectar si la petición viene de un subdominio de un inquilino  y 
// reescribir la URL para que Next.js pueda servir la página o la ruta de la API.

export default function middleware(req: NextRequest) {
  
  const url = req.nextUrl;                                                                  // URL original de la petición

  const hostname = req.headers.get("host") || "";                                           // extract the host name: ("jisap.funroad.com" or "jisap.localhost:3000")

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";                             // "funroad.com" or "localhost:3000"

  if(hostname.endsWith(`.${rootDomain}`)){
    const tenantSlug = hostname.replace(`.${rootDomain}`, "");                              // jisap
    return NextResponse.rewrite(new URL(`/tenants/${tenantSlug}${url.pathname}`, req.url)); // "https://tenants/jisap/url.pathname" (url.pathname = resto de la url despues del subdomino) 
  }

  return NextResponse.next();
}



  
