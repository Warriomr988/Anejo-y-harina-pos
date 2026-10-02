// Vista MIS PEDIDOS: historial de pedidos registrados en el servidor.
// Cada fila se puede desplegar para ver el detalle de lo pedido.
import { Fragment, useEffect, useState } from 'react';
import { apiUrl } from '../api';
import { formatPrice } from '../data/menu';

interface OrderItem {
  dishId: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  type: string;
  table_label: string;
  note: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string | null;
  pagado_con: number | null;
  cambio: number | null;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const TYPE_LABEL: Record<string, string> = {
  domicilio: 'Domicilio',
  mesa: 'En mesa',
  llevar: 'Para llevar',
};

const STATUS_LABEL: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

function formatDate(iso: string): string {
  // created_at viene en UTC ("YYYY-MM-DD HH:MM:SS"); se muestra en hora local.
  const d = new Date(`${iso.replace(' ', 'T')}Z`);
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersScreen({ active = true }: { active?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // El historial vive en estado estable y se recarga de la API (SQLite) al
  // montar y al volver a la pestaña: el scroll o los re-renders nunca lo
  // borran. Si la recarga falla, se conservan los datos ya cargados.
  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError(false);
    fetch(apiUrl('/api/orders'))
      .then((r) => {
        if (!r.ok) throw new Error('API no disponible');
        return r.json() as Promise<{ orders: Order[] }>;
      })
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>Mis pedidos</h1>
        <p className="screen-sub">Historial de pedidos registrados en la caja</p>
      </header>

      {loading && <p className="muted">Cargando pedidos…</p>}
      {error && (
        <p className="form-error">
          No se pudo conectar con el servidor. Los pedidos se guardan en la base de datos local del servidor.
        </p>
      )}
      {!loading && !error && orders.length === 0 && (
        <p className="muted">Aún no hay pedidos registrados.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Ítems</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const open = expandedId === o.id;
                return (
                  <Fragment key={o.id}>
                    <tr
                      className="clickable-row"
                      onClick={() => setExpandedId(open ? null : o.id)}
                      title="Clic para ver el detalle"
                    >
                      <td>
                        #{o.id} <span className={`row-chevron${open ? ' open' : ''}`} aria-hidden="true">▾</span>
                      </td>
                      <td>{formatDate(o.created_at)}</td>
                      <td>
                        {TYPE_LABEL[o.type] ?? o.type}
                        {o.type === 'mesa' && o.table_label ? ` · Mesa ${o.table_label}` : ''}
                      </td>
                      <td>
                        {o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                      </td>
                      <td className="num">{formatPrice(o.total)}</td>
                      <td>
                        {o.payment_method === 'efectivo' && o.pagado_con != null
                          ? `Efectivo · recibió ${formatPrice(o.pagado_con)}${
                              o.cambio != null && o.cambio > 0 ? ` · cambio ${formatPrice(o.cambio)}` : ''
                            }`
                          : (o.payment_method ?? '—')}
                      </td>
                      <td>
                        <span className={`status status-${o.status}`}>
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </td>
                    </tr>
                    {open && (
                      <tr className="detail-row">
                        <td colSpan={7}>
                          <div className="order-detail">
                            <p className="sale-detail-title">
                              Detalle del pedido #{o.id} · {TYPE_LABEL[o.type] ?? o.type}
                              {o.type === 'mesa' && o.table_label ? ` · Mesa ${o.table_label}` : ''} ·{' '}
                              {formatDate(o.created_at)}
                            </p>
                            <ul className="sale-items">
                              {o.items.map((i, idx) => (
                                <li key={idx} className="sale-item">
                                  <span>
                                    {i.name} × {i.qty}
                                  </span>
                                  <span className="num">{formatPrice(i.qty * i.price)}</span>
                                </li>
                              ))}
                            </ul>
                            {(o.pagado_con != null || o.cambio != null) && (
                              <p className="sale-pay">
                                {o.pagado_con != null && <>Pagó con {formatPrice(o.pagado_con)}</>}
                                {o.pagado_con != null && o.cambio != null && o.cambio > 0 && ' · '}
                                {o.cambio != null && o.cambio > 0 && (
                                  <>Cambio {formatPrice(o.cambio)}</>
                                )}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
