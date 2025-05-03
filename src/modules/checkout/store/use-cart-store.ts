import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TenantCart {
  productIds: string[];
};

interface CartState {
  tenantCarts: Record<string, TenantCart>;
  addProduct: (tenantSlug: string, productId: string) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
  getCartByTenant: (tenantSlug: string) => string[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      
      tenantCarts: {}, // Inicialización del store
      
      addProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,                                     // copia es estado de tenantCarts
            [tenantSlug]: {                                           // En la clave tenantSlug, agrega un nuevo objeto 
              productIds: [                                           // y dentro define el nuevo valor para productIds   
                ...(state.tenantCarts[tenantSlug]?.productIds || []),     // 1º  copia el valor de productIds si existe
                productId,                                                // 2º  agrega el productId a esa posición
              ]
            }
          }
        })),

      removeProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds: state.tenantCarts[tenantSlug]?.productIds.filter(  // Mantiene solo los IDs que NO son el que queremos quitar
                (id) => id !== productId
              ) || [],
            }
          }
        })),

      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds: []
            }
          }
        })),

      clearAllCarts: () =>
        set({
          tenantCarts: {}
        }),

      getCartByTenant: (tenantSlug) =>
        get().tenantCarts[tenantSlug]?.productIds || [],
    }),

    {
      name: "funroad-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)