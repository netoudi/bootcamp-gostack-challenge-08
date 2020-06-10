import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsInStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsInStorage) {
        setProducts(JSON.parse(productsInStorage));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    async function saveStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }

    // console.info(JSON.stringify({ state: products }, null, 2));
    saveStorage();
  }, [products]);

  const addToCart = useCallback(product => {
    setProducts(state => {
      const findProduct = state.find(el => el.id === product.id);

      if (findProduct !== undefined) return state;

      return [...state, { ...product, quantity: 1 }];
    });
  }, []);

  const increment = useCallback(id => {
    setProducts(state =>
      state.map(product => {
        if (product.id !== id) return product;

        return {
          ...product,
          quantity: product.quantity + 1,
        };
      }),
    );
  }, []);

  const decrement = useCallback(id => {
    setProducts(state => {
      const findProduct = state.find(el => el.id === id);

      if (findProduct === undefined) return state;
      if (findProduct.quantity - 1 <= 0) return state;

      return state.map(product => {
        if (product.id !== id) return product;
        // if (product.quantity - 1 <= 0) return product;

        return {
          ...product,
          quantity: product.quantity - 1,
        };
      });
    });
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
