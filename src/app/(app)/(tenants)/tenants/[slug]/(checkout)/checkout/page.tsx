import { CheckoutView } from "@/modules/checkout/ui/views/checkout-view";

interface PageProps {
  params: Promise<{ slug: string }>;  // Se reciben los params de la ruta de la URL [slug]

}


//http:localhost:3000/tenants/[slug]/checkout
const CheckoutPage = async ({ params }: PageProps) => {

  const { slug } = await params;

  return (
    <CheckoutView  tenantSlug={slug} />
  )
}

export default CheckoutPage