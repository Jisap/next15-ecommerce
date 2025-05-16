import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTenantURL(tenantSlug: string) {

  // In developmed mode use normal routing
  if(process.env.NODE_ENV === "development") {                        // development http://localhost:3000/tenants/jisap
    return `/tenants/${tenantSlug}`;
  };

  const protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  // In production mode use subdomain routing
  return `${protocol}://${tenantSlug}.${domain}`;                     // production https://jisap.funroad.com
}

export const formatCurrency = (value: number | string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value)) 
}