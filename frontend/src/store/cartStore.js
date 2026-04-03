import { create } from 'zustand';

const useCartStore = create((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: null }),
}));

export default useCartStore;
