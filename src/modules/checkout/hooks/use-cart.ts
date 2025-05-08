
import { useCallback } from "react";
import { useCartStore } from "../store/use-cart-store";
import { useShallow } from "zustand/react/shallow"

export const useCart = (tenantSlug: string) => {                                                     // Hook para el manejo del cart-store

  // Selección individual de acciones (Optimización clave)
  // Estas referencias de funciones son estables y no cambian,
  // por lo que no causan re-renders innecesarios del hook useCart.
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);

  // Selección reactiva de los productIds para el tenantSlug actual.
  // useShallow ayuda a prevenir re-renders si el array productIds es recreado
  // pero su contenido (los IDs) no ha cambiado.
  const productIds = useCartStore(useShallow((state) => state.tenantCarts[tenantSlug]?.productIds || []));

  // Funciones memoizadas que el componente usará.
  // Se recrearán solo si sus dependencias cambian.

  const toggleProduct = useCallback(
    (productId: string) => {
      if(productIds.includes(productId)){
        removeProduct(tenantSlug, productId);
      } else {
        addProduct(tenantSlug, productId);
      }
    },[addProduct, removeProduct, productIds, tenantSlug]
  )

  const isProductInCart = useCallback(
    (productId: string) => {
      return productIds.includes(productId)
    },[productIds]
  ) 

  const clearTenantCart = useCallback(
    () =>  clearCart(tenantSlug),[tenantSlug, clearCart]
  )

  const handleAddProduct = useCallback(
    (productId: string) => {
      addProduct(tenantSlug, productId);
    },[addProduct, tenantSlug]
  )

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      removeProduct(tenantSlug, productId);
    },[removeProduct, tenantSlug]
  )

  return {
    productIds,
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    totalItems: productIds.length,
  }
}