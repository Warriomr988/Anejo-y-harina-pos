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
/** Recargo fijo por domicilio (pesos colombianos). */
export const DELIVERY_FEE = 4000;
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
// Categorías (las 5 de la fila de iconos)
// ---------------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  { id: 'empanadas', name: 'Empanadas', icon: '🥟' },
  { id: 'cafe', name: 'Cafés', icon: '☕' },
  { id: 'bebidas-calientes', name: 'Bebidas calientes', icon: '🍵' },
  { id: 'te', name: 'Té e infusiones', icon: '🫖' },
  { id: 'adiciones', name: 'Adiciones', icon: '🌶️' },
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
    price: 3500,
    description: 'Empanada de harina espolvoreada con azúcar.',
    visual: 'empanada',
    photo: null,
  },
  // ---- ADICIONES ----
  {
    id: 'aji-mani-4oz',
    name: 'Ají de maní 4 oz.',
    categoryId: 'adiciones',
    categoryName: 'Adiciones',
    price: 5000,
    description: 'Porción adicional de nuestro ají de maní cremoso.',
    visual: 'aji',
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
  // ---- BEBIDAS CALIENTES ----
  {
    id: 'chocolate',
    name: 'Chocolate',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 6500,
    description: 'Chocolate caliente tradicional.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'chocolate-queso',
    name: 'Chocolate con queso',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 12000,
    description: 'Mozzarella o queso campesino.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'chocolate-vienes',
    name: 'Chocolate vienés',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 10000,
    description: 'Chocolate caliente con crema batida.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'babychino',
    name: 'Babychino',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 6200,
    description: 'Caramelo, vainilla o amaretto.',
    visual: 'latte',
    photo: null,
  },
  {
    id: 'milo-caliente',
    name: 'Milo caliente',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 8500,
    description: 'El clásico Milo, bien caliente.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'agua-panela-queso',
    name: 'Agua de panela con queso',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 9500,
    description: 'Mozzarella o queso campesino.',
    visual: 'panela',
    photo: null,
  },
  {
    id: 'matcha-latte',
    name: 'Matcha latte',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 10000,
    description: 'Té verde matcha con miel de abeja.',
    visual: 'matcha',
    photo: null,
  },
  {
    id: 'moon-milk-latte',
    name: 'Moon milk latte',
    categoryId: 'bebidas-calientes',
    categoryName: 'Bebidas calientes',
    price: 10000,
    description: 'Golden milk y ashwagandha.',
    visual: 'latte',
    photo: null,
  },
  // ---- TÉ, AROMÁTICAS E INFUSIONES ----
  {
    id: 'amor-perfecto',
    name: 'Amor perfecto',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 12500,
    description: 'Hibisco, hierbabuena, naranja, limonaria y rosas silvestres.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'serenidad',
    name: 'Serenidad',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 12500,
    description: 'Lavanda, tilo, pasiflora, manzanilla y caléndula.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'hadas-feerico',
    name: 'Hadas féerico',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 12500,
    description: 'Hibisco, lavanda, hipérico y salvia.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'aromatica-natural',
    name: 'Aromática natural o de bolsita',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 5000,
    description: 'La aromática de todos los días.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'aromatica-hierbas-frutas',
    name: 'Aromática de hierbas y frutas',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 7000,
    description: 'Hierbas frescas y frutas deshidratadas.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'te-negro-agua',
    name: 'Té negro en agua',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 5500,
    description: 'Té negro preparado en agua.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'te-negro-leche',
    name: 'Té negro en leche',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 7500,
    description: 'Té negro cremoso con leche.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'te-ingles',
    name: 'Té inglés',
    categoryId: 'te',
    categoryName: 'Té e infusiones',
    price: 8000,
    description: 'English breakfast, earl gray, té verde o frutos rojos; en agua o en leche.',
    visual: 'te',
    photo: null,
  },
];

/** Denominaciones de billetes colombianos para el pago en efectivo. */
export const BILL_DENOMINATIONS = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

/** Tipos de pedido del terminal POS. */
export type OrderType = 'domicilio' | 'mesa' | 'llevar';

export const ORDER_TYPES: Array<{ id: OrderType; name: string }> = [
  { id: 'domicilio', name: 'Domicilio' },
  { id: 'mesa', name: 'En mesa' },
  { id: 'llevar', name: 'Para llevar' },
];
