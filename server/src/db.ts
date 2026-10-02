// Capa de base de datos: usa node:sqlite (módulo incluido en Node 22+,
// sin compilación ni dependencias nativas: ideal para Termux en Android).
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { CATEGORIES, DISHES, SEED_VERSION } from './seed.js';

// La base vive en server/pos.db. Se puede cambiar con la variable DB_PATH.
const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), 'pos.db');

export const db = new DatabaseSync(dbPath);

// Crea las tablas si no existen y carga el menú según la versión de la semilla.
// Si SEED_VERSION cambió (p. ej. nuevo menú), reconstruye el catálogo
// conservando el historial de pedidos.
export function initDb(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dishes (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      visual TEXT NOT NULL DEFAULT 'cafe',
      photo TEXT,
      includes_empanadas INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_label TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'domicilio',
      note TEXT NOT NULL DEFAULT '',
      subtotal REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      delivery_fee REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'borrador',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      dish_id TEXT NOT NULL REFERENCES dishes(id),
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,
      category_id TEXT NOT NULL DEFAULT '',
      includes_empanadas INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Migración para bases creadas antes de las columnas de pago en efectivo.
  const orderCols = db.prepare('PRAGMA table_info(orders)').all() as Array<{ name: string }>;
  if (!orderCols.some((c) => c.name === 'pagado_con')) {
    db.exec('ALTER TABLE orders ADD COLUMN pagado_con INTEGER');
  }
  if (!orderCols.some((c) => c.name === 'cambio')) {
    db.exec('ALTER TABLE orders ADD COLUMN cambio INTEGER');
  }

  // Migración para bases creadas antes de las columnas de combo/categoría:
  // dishes.includes_empanadas (empanadas incluidas en combos) y
  // order_items.category_id + includes_empanadas (para estadísticas de ventas
  // que no dependen del catálogo vigente).
  const dishCols = db.prepare('PRAGMA table_info(dishes)').all() as Array<{ name: string }>;
  if (!dishCols.some((c) => c.name === 'includes_empanadas')) {
    db.exec('ALTER TABLE dishes ADD COLUMN includes_empanadas INTEGER NOT NULL DEFAULT 0');
  }
  const itemCols = db.prepare('PRAGMA table_info(order_items)').all() as Array<{ name: string }>;
  if (!itemCols.some((c) => c.name === 'category_id')) {
    db.exec("ALTER TABLE order_items ADD COLUMN category_id TEXT NOT NULL DEFAULT ''");
  }
  if (!itemCols.some((c) => c.name === 'includes_empanadas')) {
    db.exec('ALTER TABLE order_items ADD COLUMN includes_empanadas INTEGER NOT NULL DEFAULT 0');
  }
  // Rellena las columnas en pedidos antiguos usando el catálogo vigente
  // (esto corre ANTES de que la semilla reconstruya el catálogo, así los
  // pedidos viejos conservan su categoría real).
  db.exec(`
    UPDATE order_items
    SET category_id = COALESCE((SELECT d.category_id FROM dishes d WHERE d.id = order_items.dish_id), ''),
        includes_empanadas = COALESCE((SELECT d.includes_empanadas FROM dishes d WHERE d.id = order_items.dish_id), 0)
    WHERE category_id = ''
  `);

  const row = db
    .prepare("SELECT value FROM meta WHERE key = 'seed_version'")
    .get() as { value: string } | undefined;

  // Índice de conveniencia para las consultas del registro diario
  // (agrupan y filtran por la fecha en hora de Colombia).
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_orders_fecha_co ON orders(date(created_at, '-5 hours'))",
  );
  if (row?.value === SEED_VERSION) return;

  // La semilla cambió: reconstruir el catálogo (el historial de pedidos se conserva,
  // pues order_items guarda nombre y precio de cada línea).
  // Se pausan las claves foráneas durante la reconstrucción porque order_items
  // puede referenciar platos del menú anterior.
  const fkRow = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
  const fkWasOn = fkRow.foreign_keys === 1;
  if (fkWasOn) db.exec('PRAGMA foreign_keys = OFF');
  try {
    db.exec('DELETE FROM dishes; DELETE FROM categories;');
  } finally {
    if (fkWasOn) db.exec('PRAGMA foreign_keys = ON');
  }

  // Migración para bases creadas antes de la columna `visual`.
  const cols = db.prepare('PRAGMA table_info(dishes)').all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === 'visual')) {
    db.exec("ALTER TABLE dishes ADD COLUMN visual TEXT NOT NULL DEFAULT 'cafe'");
  }

  const insertCat = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
  const insertDish = db.prepare(
    'INSERT INTO dishes (id, category_id, name, price, description, visual, photo, includes_empanadas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  for (const c of CATEGORIES) insertCat.run(c.id, c.name);
  for (const d of DISHES)
    insertDish.run(d.id, d.categoryId, d.name, d.price, d.description, d.visual, d.photo, d.includesEmpanadas ?? 0);

  db.prepare(
    "INSERT INTO meta (key, value) VALUES ('seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(SEED_VERSION);

  console.log(`Menú actualizado en ${dbPath} (semilla v${SEED_VERSION}, ${DISHES.length} productos).`);
}
