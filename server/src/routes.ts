// Rutas de la API de Añejo y Harina (terminal POS).
import { Router, type Request, type Response } from 'express';
import { db } from './db.js';

// Constantes de negocio (editables). Deben coincidir con el cliente.

const VALID_STATUS = ['borrador', 'confirmado', 'pagado', 'cancelado'] as const;
type OrderStatus = (typeof VALID_STATUS)[number];

interface DishRow {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description: string;
  visual: string;
  photo: string | null;
  category_name: string;
  includes_empanadas: number | null;
}

export const apiRouter = Router();

// GET /api/categories → lista de categorías
apiRouter.get('/categories', (_req: Request, res: Response) => {
  const categories = db.prepare('SELECT id, name FROM categories ORDER BY name').all();
  res.json({ categories });
});

// GET /api/menu → platos con su categoría
apiRouter.get('/menu', (_req: Request, res: Response) => {
  const rows = db
    .prepare(
      `SELECT d.id, d.category_id, d.name, d.price, d.description, d.visual, d.photo,
              d.includes_empanadas, c.name AS category_name
       FROM dishes d JOIN categories c ON c.id = d.category_id
       ORDER BY c.name, d.name`,
    )
    .all() as unknown as DishRow[];
  const dishes = rows.map((r) => ({
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    categoryName: r.category_name,
    price: r.price,
    description: r.description,
    visual: r.visual,
    photo: r.photo,
    includesEmpanadas: r.includes_empanadas ?? 0,
  }));
  res.json({ dishes });
});

// GET /api/orders → pedidos con sus ítems (más recientes primero)
apiRouter.get('/orders', (_req: Request, res: Response) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all() as Array<{
    id: number;
  }>;
  const itemsStmt = db.prepare('SELECT dish_id AS dishId, name, qty, price FROM order_items WHERE order_id = ?');
  const result = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));
  res.json({ orders: result });
});

interface OrderItemInput {
  dishId: string;
  qty: number;
}

interface CreateOrderBody {
  table?: string;
  type?: string;
  items?: OrderItemInput[];
  note?: string;
  discount?: number;
  status?: OrderStatus;
  paymentMethod?: string | null;
  /** Monto en efectivo con el que paga el cliente (pesos, entero). */
  pagadoCon?: number;
}

// POST /api/orders → crea un pedido.
// Los totales se recalculan en el servidor con los precios de la base de datos
// (no se confía en los totales que envía el cliente).
apiRouter.post('/orders', (req: Request, res: Response) => {
  const body = req.body as CreateOrderBody;
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    res.status(400).json({ error: 'El pedido no tiene ítems.' });
    return;
  }
  const status: OrderStatus = VALID_STATUS.includes(body.status as OrderStatus)
    ? (body.status as OrderStatus)
    : 'borrador';

  const dishStmt = db.prepare(
    'SELECT id, name, price, category_id, includes_empanadas FROM dishes WHERE id = ?',
  );

  let subtotal = 0;
  const lines: Array<{
    dishId: string;
    name: string;
    qty: number;
    price: number;
    categoryId: string;
    includesEmpanadas: number;
  }> = [];
  for (const it of items) {
    const qty = Math.floor(Number(it.qty));
    if (!it.dishId || !(qty > 0)) {
      res.status(400).json({ error: 'Ítem inválido en el pedido.' });
      return;
    }
    const dish = dishStmt.get(it.dishId) as
      | { id: string; name: string; price: number; category_id: string; includes_empanadas: number | null }
      | undefined;
    if (!dish) {
      res.status(400).json({ error: `Producto desconocido: ${it.dishId}` });
      return;
    }
    subtotal += dish.price * qty;
    lines.push({
      dishId: dish.id,
      name: dish.name,
      qty,
      price: dish.price,
      categoryId: dish.category_id,
      includesEmpanadas: dish.includes_empanadas ?? 0,
    });
  }

  const discount = Math.min(Math.max(Number(body.discount) || 0, 0), subtotal);
  // El terminal solo maneja pedidos en mesa (sin domicilios ni para llevar).
  const type = 'mesa';
  const deliveryFee = 0;
  // Los precios del menú ya incluyen impuestos: no se suma IVA aparte.
  const tax = 0;
  const total = subtotal - discount + deliveryFee + tax;

  // Pago en efectivo: el cambio se recalcula en el servidor (no se confía
  // en el valor que envía el cliente).
  let pagadoCon: number | null = null;
  let cambio: number | null = null;
  if (body.pagadoCon !== undefined && body.pagadoCon !== null) {
    pagadoCon = Math.floor(Number(body.pagadoCon));
    if (!(pagadoCon > 0)) {
      res.status(400).json({ error: 'Monto de pago inválido.' });
      return;
    }
    if (pagadoCon < total) {
      res.status(400).json({ error: 'El monto pagado es menor que el total.' });
      return;
    }
    cambio = pagadoCon - total;
  }

  const insertOrder = db.prepare(
    `INSERT INTO orders (table_label, type, note, subtotal, discount, delivery_fee, tax, total, payment_method, status, pagado_con, cambio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const result = insertOrder.run(
    String(body.table ?? ''),
    type,
    String(body.note ?? ''),
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    body.paymentMethod ?? null,
    status,
    pagadoCon,
    cambio,
  );
  const orderId = Number(result.lastInsertRowid);

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, dish_id, name, qty, price, category_id, includes_empanadas) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  for (const l of lines)
    insertItem.run(orderId, l.dishId, l.name, l.qty, l.price, l.categoryId, l.includesEmpanadas);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json({ order: { ...order, items: lines } });
});

// PATCH /api/orders/:id → cambia el estado del pedido
apiRouter.patch('/orders/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: string };
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'ID inválido.' });
    return;
  }
  if (!VALID_STATUS.includes(status as OrderStatus)) {
    res.status(400).json({ error: `Estado inválido. Usa: ${VALID_STATUS.join(', ')}` });
    return;
  }
  const newStatus = status as OrderStatus;
  const exists = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
  if (!exists) {
    res.status(404).json({ error: 'Pedido no encontrado.' });
    return;
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(newStatus, id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.json({ order });
});

// GET /api/ventas/resumen?periodo=hoy|semana|todo
// Registro de ventas: total vendido, número de pedidos y desglose por
// producto y por categoría (cantidades y recaudo), calculados desde las
// tablas orders/order_items. Solo cuentan los pedidos no cancelados.
// Las fechas se evalúan en hora de Colombia (UTC-5).
//
// Helper compartido: calcula el resumen para un filtro de fecha dado.
// fechaWhere es un fragmento SQL sobre la tabla orders (alias `o`); params
// son sus parámetros. Devuelve totales, conteos y desgloses.
function resumenVentas(fechaWhere: string, params: Array<string | number> = []) {
  const baseFilter = `o.status != 'cancelado' AND (${fechaWhere})`;

  const totals = db
    .prepare(
      `SELECT COALESCE(SUM(o.total), 0) AS total, COUNT(*) AS pedidos
       FROM orders o WHERE ${baseFilter}`,
    )
    .get(...params) as { total: number; pedidos: number };

  const porProducto = db
    .prepare(
      `SELECT i.name AS nombre, i.dish_id AS productoId, SUM(i.qty) AS cantidad,
              SUM(i.qty * i.price) AS total
       FROM order_items i
       JOIN orders o ON o.id = i.order_id
       WHERE ${baseFilter}
       GROUP BY i.dish_id, i.name
       ORDER BY cantidad DESC, nombre ASC`,
    )
    .all(...params) as Array<{ nombre: string; productoId: string; cantidad: number; total: number }>;

  const porCategoria = db
    .prepare(
      `SELECT COALESCE(c.name, i.category_id) AS categoria, SUM(i.qty) AS cantidad,
              SUM(i.qty * i.price) AS total
       FROM order_items i
       JOIN orders o ON o.id = i.order_id
       LEFT JOIN categories c ON c.id = i.category_id
       WHERE ${baseFilter} AND i.category_id != ''
       GROUP BY i.category_id
       ORDER BY cantidad DESC`,
    )
    .all(...params) as Array<{ categoria: string; cantidad: number; total: number }>;

  // Empanadas vendidas: unidades de la categoría 'empanadas' MÁS las empanadas
  // incluidas en combos (qty × includes_empanadas). Cafés: unidades de 'cafe'.
  // Se usa la categoría guardada en cada línea (no el catálogo vigente) para
  // que el historial no se altere al cambiar el menú.
  const stats = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN i.category_id = 'empanadas' THEN i.qty ELSE 0 END), 0)
           + COALESCE(SUM(i.qty * i.includes_empanadas), 0) AS empanadasVendidas,
         COALESCE(SUM(CASE WHEN i.category_id = 'cafe' THEN i.qty ELSE 0 END), 0) AS cafesVendidos
       FROM order_items i
       JOIN orders o ON o.id = i.order_id
       WHERE ${baseFilter}`,
    )
    .get(...params) as { empanadasVendidas: number; cafesVendidos: number };

  return {
    total: Math.round(totals.total),
    pedidos: totals.pedidos,
    empanadasVendidas: stats.empanadasVendidas,
    cafesVendidos: stats.cafesVendidos,
    porProducto,
    porCategoria,
  };
}

apiRouter.get('/ventas/resumen', (req: Request, res: Response) => {
  const periodo = req.query.periodo === 'hoy' || req.query.periodo === 'semana' ? req.query.periodo : 'todo';

  let fechaWhere = '1 = 1';
  if (periodo === 'hoy') {
    fechaWhere = "date(o.created_at, '-5 hours') = date('now', '-5 hours')";
  } else if (periodo === 'semana') {
    fechaWhere = "o.created_at >= datetime('now', '-5 hours', '-7 days')";
  }

  res.json({ periodo, ...resumenVentas(fechaWhere) });
});

// GET /api/ventas/dias → registro diario: un renglón por día con ventas
// [{fecha: "YYYY-MM-DD", numVentas, total, unidades}], más recientes primero.
// Las fechas se evalúan en hora de Colombia (UTC-5). Los datos viven en
// SQLite de forma permanente: se acumulan día tras día.
apiRouter.get('/ventas/dias', (_req: Request, res: Response) => {
  const rows = db
    .prepare(
      `SELECT d.fecha,
         (SELECT COUNT(*) FROM orders o
          WHERE o.status != 'cancelado' AND date(o.created_at, '-5 hours') = d.fecha) AS numVentas,
         (SELECT COALESCE(SUM(o.total), 0) FROM orders o
          WHERE o.status != 'cancelado' AND date(o.created_at, '-5 hours') = d.fecha) AS total,
         (SELECT COALESCE(SUM(i.qty), 0) FROM order_items i
          JOIN orders o ON o.id = i.order_id
          WHERE o.status != 'cancelado' AND date(o.created_at, '-5 hours') = d.fecha) AS unidades
       FROM (SELECT DISTINCT date(created_at, '-5 hours') AS fecha
             FROM orders WHERE status != 'cancelado') d
       ORDER BY d.fecha DESC`,
    )
    .all() as Array<{ fecha: string; numVentas: number; total: number; unidades: number }>;

  res.json({
    dias: rows.map((r) => ({
      fecha: r.fecha,
      numVentas: r.numVentas,
      total: Math.round(r.total),
      unidades: r.unidades,
    })),
  });
});

// GET /api/ventas/dia/:fecha → detalle completo de un día:
// resumen del día + cada venta con todos sus datos (hora, mesa, tipo,
// ítems con cantidad y precio, subtotales, pago en efectivo y cambio).
apiRouter.get('/ventas/dia/:fecha', (req: Request, res: Response) => {
  const fecha = req.params.fecha;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    res.status(400).json({ error: 'Fecha inválida. Usa el formato YYYY-MM-DD.' });
    return;
  }

  const resumen = resumenVentas(`date(o.created_at, '-5 hours') = ?`, [fecha]);
  const unidades = resumen.porProducto.reduce((s, p) => s + p.cantidad, 0);

  const orders = db
    .prepare(
      `SELECT o.id, o.table_label, o.type, o.note, o.subtotal, o.discount,
              o.delivery_fee, o.tax, o.total, o.payment_method, o.status,
              o.pagado_con, o.cambio,
              time(o.created_at, '-5 hours') AS hora
       FROM orders o
       WHERE o.status != 'cancelado' AND date(o.created_at, '-5 hours') = ?
       ORDER BY o.id DESC`,
    )
    .all(fecha) as Array<{
      id: number;
      table_label: string;
      type: string;
      note: string;
      subtotal: number;
      discount: number;
      delivery_fee: number;
      tax: number;
      total: number;
      payment_method: string | null;
      status: string;
      pagado_con: number | null;
      cambio: number | null;
      hora: string;
    }>;

  const itemsStmt = db.prepare(
    'SELECT name AS nombre, qty AS cantidad, price AS precio FROM order_items WHERE order_id = ?',
  );
  const ventas = orders.map((o) => ({
    id: o.id,
    hora: o.hora.slice(0, 5),
    mesa: o.table_label,
    tipo: o.type,
    nota: o.note,
    items: itemsStmt.all(o.id) as Array<{ nombre: string; cantidad: number; precio: number }>,
    subtotal: Math.round(o.subtotal),
    descuento: Math.round(o.discount),
    domicilio: Math.round(o.delivery_fee),
    total: Math.round(o.total),
    pagadoCon: o.pagado_con,
    cambio: o.cambio,
  }));

  res.json({
    fecha,
    resumen: {
      total: resumen.total,
      numVentas: resumen.pedidos,
      unidades,
      empanadasVendidas: resumen.empanadasVendidas,
      cafesVendidos: resumen.cafesVendidos,
    },
    ventas,
  });
});
