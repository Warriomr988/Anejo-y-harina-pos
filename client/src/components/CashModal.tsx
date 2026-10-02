// Modal de cobro en efectivo: valor a pagar, denominaciones de billetes
// colombianos, monto personalizado, cambio en vivo y confirmación.
import { useState } from 'react';
import { apiUrl } from '../api';
import {
  BILL_DENOMINATIONS,
  formatPrice,
  type CartItem,
  type OrderType,
} from '../data/menu';

export interface PaidOrder {
  id: number;
  total: number;
  pagadoCon: number;
  cambio: number;
}

interface Props {
  cart: CartItem[];
  total: number;
  orderType: OrderType;
  tableLabel: string;
  note: string;
  onClose: () => void;
  onPaid: (order: PaidOrder) => void;
}

export default function CashModal({
  cart,
  total,
  orderType,
  tableLabel,
  note,
  onClose,
  onPaid,
}: Props) {
  const [tendered, setTendered] = useState(0);
  const [custom, setCustom] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<PaidOrder | null>(null);

  const cambio = tendered - total;
  const canConfirm = tendered >= total && !sending;

  function addBill(value: number) {
    setTendered((t) => t + value);
  }

  function addCustom() {
    const v = Math.floor(Number(custom));
    if (v > 0) {
      setTendered((t) => t + v);
      setCustom('');
    }
  }

  async function confirm() {
    if (!canConfirm || cart.length === 0) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: orderType,
          table: tableLabel.trim(),
          items: cart.map((i) => ({ dishId: i.dish.id, qty: i.qty })),
          note: note.trim(),
          status: 'pagado',
          paymentMethod: 'efectivo',
          pagadoCon: tendered,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? 'Error del servidor');
      }
      const data = (await res.json()) as {
        order: { id: number; total: number; pagado_con: number; cambio: number };
      };
      const paid: PaidOrder = {
        id: data.order.id,
        total: data.order.total,
        pagadoCon: data.order.pagado_con,
        cambio: data.order.cambio,
      };
      setDone(paid);
      onPaid(paid);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar el pago.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Cobro en efectivo"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="modal-success">
            <div className="success-check" aria-hidden="true">
              ✓
            </div>
            <h2>¡Pago registrado!</h2>
            <p className="success-sub">
              Pedido <strong>#{done.id}</strong> cobrado en efectivo.
            </p>
            <dl className="receipt">
              <div>
                <dt>Total</dt>
                <dd>{formatPrice(done.total)}</dd>
              </div>
              <div>
                <dt>Pagó con</dt>
                <dd>{formatPrice(done.pagadoCon)}</dd>
              </div>
              <div className="highlight">
                <dt>Cambio</dt>
                <dd>{formatPrice(done.cambio)}</dd>
              </div>
            </dl>
            <button type="button" className="btn-primary" onClick={onClose}>
              Nuevo pedido
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Cobro en efectivo</h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}>
                ✕
              </button>
            </div>

            <div className="amount-due">
              <span>Valor a pagar</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <p className="field-label">Paga con</p>
            <div className="bills">
              {BILL_DENOMINATIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className="bill"
                  onClick={() => addBill(b)}
                >
                  {formatPrice(b)}
                </button>
              ))}
            </div>

            <div className="custom-row">
              <input
                type="number"
                min={0}
                placeholder="Otro valor"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustom();
                }}
              />
              <button type="button" className="btn-secondary" onClick={addCustom}>
                Añadir
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setTendered(total)}
              >
                Exacto
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setTendered(0)}
              >
                Limpiar
              </button>
            </div>

            <div className="tendered-row">
              <span>Recibido</span>
              <strong>{formatPrice(tendered)}</strong>
            </div>
            {cambio >= 0 ? (
              <div className="change-row ok">
                <span>Cambio</span>
                <strong>{formatPrice(cambio)}</strong>
              </div>
            ) : (
              <div className="change-row missing">
                <span>Faltan</span>
                <strong>{formatPrice(-cambio)}</strong>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <button
              type="button"
              className="btn-primary btn-checkout"
              disabled={!canConfirm}
              onClick={() => void confirm()}
            >
              {sending ? 'Registrando…' : 'Confirmar pago'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
