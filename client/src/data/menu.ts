// Tipos y datos del menú de AÑEJO Y HARINA (empanadas + café de Nariño).
//
// Estos datos se usan como respaldo local si la API no está disponible.
// El servidor (server/src/seed.ts) carga el mismo menú en SQLite al arrancar.
// Mantén ambas copias sincronizadas.

export interface Category {
  id: string;
  name: string;
  /** Emoji usado como icono ilustrado de la categoría. */
  icon: string;
}

export type DishVisualKind =
  | 'empanada'
  | 'cafe'
  | 'latte'
  | 'capuchino'
  | 'mocachino'
  | 'chocolate'
  | 'te'
  | 'matcha'
  | 'aji'
  | 'panela';

export interface Dish {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  /** Precio en pesos colombianos (entero). */
  price: number;
  description: string;
  /** Ilustración que se muestra en la tarjeta (SVG dibujado en código). */
  visual: DishVisualKind;
  /**
   * Nombre del archivo de foto dentro de client/public/img/
   * (p. ej. "empanada-anejo.jpg"). null = ilustración SVG.
   * Ver README.md, sección "Fotos de los productos".
   */
  photo: string | null;
  /** Empanadas incluidas en el producto (combos): se suman a "empanadas vendidas". */
  includesEmpanadas?: number;
}

export interface CartItem {
  dish: Dish;
  qty: number;
}

export type TabId = 'inicio' | 'menu' | 'pedidos' | 'ventas' | 'registro' | 'ajustes';

// ---------------------------------------------------------------------------
// Constantes de negocio (editables)
// ---------------------------------------------------------------------------
export const RESTAURANT_NAME = 'Añejo y Harina';
export const RESTAURANT_TAGLINE = 'Empanadas y café de Nariño';
export const DELIVERY_CITY = 'Pasto, Nariño';
/** Símbolo de moneda. */
export const CURRENCY = '$';
/** Puntos del Club del Café: 1 punto por cada $1.000 del subtotal. */
export const POINTS_PER_1000 = 1;
/** Puntos necesarios para desbloquear la recompensa de muestra. */
export const REWARD_GOAL = 200;
export const REWARD_NAME = 'Café negro gratis';

/** Precio en formato colombiano: $3.600 */
export function formatPrice(n: number): string {
  const rounded = Math.round(n);
  return `${CURRENCY}${rounded.toLocaleString('es-CO')}`;
}

// ---------------------------------------------------------------------------
// Categorías (las 2 de la fila de iconos)
// ---------------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  { id: 'empanadas', name: 'Empanadas', icon: '🥟' },
  { id: 'cafe', name: 'Cafés', icon: '☕' },
];

// ---------------------------------------------------------------------------
// Menú completo (nombres y precios exactos del restaurante)
// ---------------------------------------------------------------------------
export const MENU_DISHES: Dish[] = [
  // ---- EMPANADAS Y TÍPICOS ----
  {
    id: 'empanada-anejo-aji-mani',
    name: 'Empanada de añejo con ají de maní',
    categoryId: 'empanadas',
    categoryName: 'Empanadas',
    price: 500,
    description: 'La clásica pastusa: empanada de añejo dorada con ají de maní de la casa.',
    visual: 'empanada',
    photo: null,
  },
  {
    id: 'empanada-harina-azucar',
    name: 'Empanada de harina con azúcar',
    categoryId: 'empanadas',
    categoryName: 'Empanadas',
    price: 500,
    description: 'Empanada de harina espolvoreada con azúcar.',
    visual: 'empanada',
    photo: null,
  },
  // ---- CAFÉS ----
  {
    id: 'cafe-negro',
    name: 'Café negro',
    categoryId: 'cafe',
    categoryName: 'Cafés',
    price: 2000,
    description: 'Café negro de Nariño, bien cargado.',
    visual: 'cafe',
    photo: null,
  },
  {
    id: 'cafe-negro-2-empanadas',
    name: 'Café negro con 2 empanadas',
    categoryId: 'cafe',
    categoryName: 'Cafés',
    price: 3000,
    description: 'Combo: café negro + 2 empanadas de añejo.',
    visual: 'cafe',
    photo: null,
    includesEmpanadas: 2,
  },
  {
    id: 'cafe-con-leche',
    name: 'Café con leche',
    categoryId: 'cafe',
    categoryName: 'Cafés',
    price: 2000,
    description: 'Café de Nariño con leche caliente.',
    visual: 'latte',
    photo: null,
  },
  {
    id: 'cafe-con-leche-2-empanadas',
    name: 'Café con leche con 2 empanadas',
    categoryId: 'cafe',
    categoryName: 'Cafés',
    price: 3000,
    description: 'Combo: café con leche + 2 empanadas de añejo.',
    visual: 'latte',
    photo: null,
    includesEmpanadas: 2,
  },
  {
    id: 'aromatica',
    name: 'Aromática',
    categoryId: 'cafe',
    categoryName: 'Cafés',
    price: 2000,
    description: 'Aromática caliente tradicional.',
    visual: 'te',
    photo: null,
  },
];

/** Denominaciones de billetes colombianos para el pago en efectivo. */
export const BILL_DENOMINATIONS = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

/** Tipo de pedido del terminal POS (todos los pedidos son en mesa). */
export type OrderType = 'mesa';

export const ORDER_TYPES: Array<{ id: OrderType; name: string }> = [
  { id: 'mesa', name: 'En mesa' },
];
