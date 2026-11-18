"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PackSummary } from "@/lib/catalog";

export type CartLine = { packId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  packs: PackSummary[];
  ready: boolean;
  count: number;
  subtotalCop: number;
  add: (packId: string, quantity?: number, options?: { openDrawer?: boolean }) => void;
  setQuantity: (packId: string, quantity: number) => void;
  remove: (packId: string) => void;
  clear: () => void;
  getPack: (packId: string) => PackSummary | undefined;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "linfovit_cart_v1";

export function CartProvider({
  packs,
  children,
}: {
  packs: PackSummary[];
  children: ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          const valid = parsed
            .filter((line) => packs.some((pack) => pack.id === line.packId))
            .map((line) => ({
              packId: line.packId,
              quantity: Math.min(10, Math.max(1, Number(line.quantity) || 1)),
            }));
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLines(valid);
        }
      }
    } catch {
      /* carrito corrupto: se ignora */
    }
    // El carrito vive en localStorage; cargarlo requiere un efecto tras la hidratación.
    setReady(true);
  }, [packs]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [lines, ready]);

  const getPack = useCallback(
    (packId: string) => packs.find((pack) => pack.id === packId),
    [packs],
  );

  const add = useCallback(
    (packId: string, quantity = 1, options?: { openDrawer?: boolean }) => {
      if (!packs.some((pack) => pack.id === packId)) return;
      setLines((current) => {
        const existing = current.find((line) => line.packId === packId);
        if (existing) {
          return current.map((line) =>
            line.packId === packId
              ? { ...line, quantity: Math.min(10, line.quantity + quantity) }
              : line,
          );
        }
        return [...current, { packId, quantity: Math.min(10, Math.max(1, quantity)) }];
      });
      if (options?.openDrawer !== false) setDrawerOpen(true);
    },
    [packs],
  );

  const setQuantity = useCallback(
    (packId: string, quantity: number) => {
      setLines((current) =>
        quantity <= 0
          ? current.filter((line) => line.packId !== packId)
          : current.map((line) =>
              line.packId === packId
                ? { ...line, quantity: Math.min(10, Math.max(1, quantity)) }
                : line,
            ),
      );
    },
    [],
  );

  const remove = useCallback((packId: string) => {
    setLines((current) => current.filter((line) => line.packId !== packId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const count = useMemo(
    () => lines.reduce((total, line) => total + (getPack(line.packId)?.quantity ?? 0) * line.quantity, 0),
    [lines, getPack],
  );

  const subtotalCop = useMemo(
    () =>
      lines.reduce(
        (total, line) => total + (getPack(line.packId)?.priceCop ?? 0) * line.quantity,
        0,
      ),
    [lines, getPack],
  );

  const value: CartContextValue = {
    lines,
    packs,
    ready,
    count,
    subtotalCop,
    add,
    setQuantity,
    remove,
    clear,
    getPack,
    drawerOpen,
    setDrawerOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
