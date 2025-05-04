import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  tenantSlug: string;
  productId: string;
}

const CartButton = ({ tenantSlug, productId }: Props) => {

  const cart = useCart(tenantSlug);

  return (
    <Button
      variant="elevated"
      className={cn(
        'flex-1 bg-pink-400',
        cart.isProductInCart(productId) && "bg-white"
      )}
      onClick={() => cart.toggleProduct(productId)} // No hay que añadir el tenantSlug porque se añade en el hook
    >
      {cart.isProductInCart(productId) ? "Remove from cart" : "Add to cart"}
    </Button>
  )
}

export default CartButton