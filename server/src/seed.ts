// Menú de AÑEJO Y HARINA (empanadas + café de Nariño, Pasto).
// Se carga en SQLite cuando la semilla cambia de versión (ver db.ts).
// El cliente (client/src/data/menu.ts) tiene una copia como respaldo local:
// mantén ambas sincronizadas.

export interface SeedCategory {
  id: string;
  name: string;
}

export interface SeedDish {
  id: string;
  name: string;
  categoryId: string;
  /** Precio en pesos colombianos (entero). */
  price: number;
  description: string;
  /** Ilustración SVG (ver client/src/components/DishVisual.tsx). */
  visual: string;
  /** Archivo en client/public/img/ o null (ver README). */
  photo: string | null;
  /** Empanadas incluidas en el producto (combos): se suman a "empanadas vendidas". */
  includesEmpanadas?: number;
}

/** Versión de la semilla: súbela cuando cambies categorías o platos. */
export const SEED_VERSION = '4';

export const CATEGORIES: SeedCategory[] = [
  { id: 'empanadas', name: 'Empanadas' },
  { id: 'cafe', name: 'Cafés' },
  { id: 'bebidas-calientes', name: 'Bebidas calientes' },
  { id: 'te', name: 'Té e infusiones' },
  { id: 'adiciones', name: 'Adiciones' },
];

export const DISHES: SeedDish[] = [
  // ---- EMPANADAS Y TÍPICOS ----
  {
    id: 'empanada-anejo-aji-mani',
    name: 'Empanada de añejo con ají de maní',
    categoryId: 'empanadas',
    price: 500,
    description: 'La clásica pastusa: empanada de añejo dorada con ají de maní de la casa.',
    visual: 'empanada',
    photo: null,
  },
  {
    id: 'empanada-harina-azucar',
    name: 'Empanada de harina con azúcar',
    categoryId: 'empanadas',
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
    price: 2000,
    description: 'Café negro de Nariño, bien cargado.',
    visual: 'cafe',
    photo: null,
  },
  {
    id: 'cafe-negro-2-empanadas',
    name: 'Café negro con 2 empanadas',
    categoryId: 'cafe',
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
    price: 2000,
    description: 'Café de Nariño con leche caliente.',
    visual: 'latte',
    photo: null,
  },
  {
    id: 'cafe-con-leche-2-empanadas',
    name: 'Café con leche con 2 empanadas',
    categoryId: 'cafe',
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
    price: 6500,
    description: 'Chocolate caliente tradicional.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'chocolate-queso',
    name: 'Chocolate con queso',
    categoryId: 'bebidas-calientes',
    price: 12000,
    description: 'Mozzarella o queso campesino.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'chocolate-vienes',
    name: 'Chocolate vienés',
    categoryId: 'bebidas-calientes',
    price: 10000,
    description: 'Chocolate caliente con crema batida.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'babychino',
    name: 'Babychino',
    categoryId: 'bebidas-calientes',
    price: 6200,
    description: 'Caramelo, vainilla o amaretto.',
    visual: 'latte',
    photo: null,
  },
  {
    id: 'milo-caliente',
    name: 'Milo caliente',
    categoryId: 'bebidas-calientes',
    price: 8500,
    description: 'El clásico Milo, bien caliente.',
    visual: 'chocolate',
    photo: null,
  },
  {
    id: 'agua-panela-queso',
    name: 'Agua de panela con queso',
    categoryId: 'bebidas-calientes',
    price: 9500,
    description: 'Mozzarella o queso campesino.',
    visual: 'panela',
    photo: null,
  },
  {
    id: 'matcha-latte',
    name: 'Matcha latte',
    categoryId: 'bebidas-calientes',
    price: 10000,
    description: 'Té verde matcha con miel de abeja.',
    visual: 'matcha',
    photo: null,
  },
  {
    id: 'moon-milk-latte',
    name: 'Moon milk latte',
    categoryId: 'bebidas-calientes',
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
    price: 12500,
    description: 'Hibisco, hierbabuena, naranja, limonaria y rosas silvestres.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'serenidad',
    name: 'Serenidad',
    categoryId: 'te',
    price: 12500,
    description: 'Lavanda, tilo, pasiflora, manzanilla y caléndula.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'hadas-feerico',
    name: 'Hadas féerico',
    categoryId: 'te',
    price: 12500,
    description: 'Hibisco, lavanda, hipérico y salvia.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'aromatica-natural',
    name: 'Aromática natural o de bolsita',
    categoryId: 'te',
    price: 5000,
    description: 'La aromática de todos los días.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'aromatica-hierbas-frutas',
    name: 'Aromática de hierbas y frutas',
    categoryId: 'te',
    price: 7000,
    description: 'Hierbas frescas y frutas deshidratadas.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'te-negro-agua',
    name: 'Té negro en agua',
    categoryId: 'te',
    price: 5500,
    description: 'Té negro preparado en agua.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'te-negro-leche',
    name: 'Té negro en leche',
    categoryId: 'te',
    price: 7500,
    description: 'Té negro cremoso con leche.',
    visual: 'te',
    photo: null,
  },
  {
    id: 'te-ingles',
    name: 'Té inglés',
    categoryId: 'te',
    price: 8000,
    description: 'English breakfast, earl gray, té verde o frutos rojos; en agua o en leche.',
    visual: 'te',
    photo: null,
  },
];
