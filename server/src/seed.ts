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
export const SEED_VERSION = '6';

export const CATEGORIES: SeedCategory[] = [
  { id: 'empanadas', name: 'Empanadas' },
  { id: 'cafe', name: 'Cafés' },
];

export const DISHES: SeedDish[] = [
  // ---- EMPANADAS ----
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
];
