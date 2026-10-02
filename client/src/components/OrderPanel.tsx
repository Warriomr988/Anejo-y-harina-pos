// Panel derecho "Resumen del pedido": tipo de pedido, líneas con cantidades,
// nota, totales y botón para cobrar.
import DishVisual from './DishVisual';
import {
  DELIVERY_FEE,
  ORDER_TYPES,
  formatPrice,
  type CartItem,
  type OrderType,
} from '../data/menu';

interface Props {
  cart: CartItem[];
  note: string;
  onNote: (note: string) => void;
  onQty: (dishId: string, delta: number) => void;
  onRemove: (dishId: string) => void;
  orderType: OrderType;
  onOrderType: (t: OrderType) => void;
  tableLabel: string;
  onTableLabel: (v: string) => void;
  onCheckout: () => void;
}

export default function OrderPanel({
  cart,
  note,
  onNote,
  onQty,
  onRemove,
  orderType,
  onOrderType,
  tableLabel,
  onTableLabel,
  onCheckout,
}: Props) {
  const subtotal = cart.reduce((s, i) => s + i.dish.price * i.qty, 0);
  const deliveryFee = orderType === 'domicilio' && cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return (
    <aside className="order-panel">
      <h2>Resumen del pedido</h2>

      <div className="order-types" role="group" aria-label="Tipo de pedido">
        {ORDER_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`order-type${orderType === t.id ? ' active' : ''}`}
            onClick={() => onOrderType(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {orderType === 'mesa' && (
        <label className="table-field">
          <span>Mesa</span>
          <input
            type="text"
            placeholder="Ej.: 5"
            value={tableLabel}
            onChange={(e) => onTableLabel(e.target.value)}
          />
        </label>
      )}

      {cart.length === 0 ? (
        <div className="order-empty">
          <div className="order-empty-art" aria-hidden="true">
            <DishVisual kind="empanada" />
          </div>
          <p>Añade productos del menú para armar el pedido.</p>
        </div>
      ) : (
        <ul className="order-lines">
          {cart.map((i) => (
            <li key={i.dish.id} className="order-line">
              <div className="order-thumb" aria-hidden="true">
                <DishVisual kind={i.dish.visual} />
              </div>
              <div className="order-line-info">
                <h4>{i.dish.name}</h4>
                <span className="price">{formatPrice(i.dish.price)}</span>
                <div className="stepper stepper-sm">
                  <button
                    type="button"
                    aria-label={`Quitar uno de ${i.dish.name}`}
                    onClick={() => onQty(i.dish.id, -1)}
                  >
                    −
                  </button>
                  <span>{i.qty}</span>
                  <button
                    type="button"
                    aria-label={`Añadir uno de ${i.dish.name}`}
                    onClick={() => onQty(i.dish.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn-delete"
                aria-label={`Eliminar ${i.dish.name} del pedido`}
                onClick={() => onRemove(i.dish.id)}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="note-field">
        <span>Nota del pedido</span>
        <textarea
          rows={2}
          placeholder="Ej.: el ají aparte, para llevar…"
          value={note}
          onChange={(e) => onNote(e.target.value)}
        />
      </label>

      <div className="summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Domicilio</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <button
        type="button"
        className="btn-primary btn-checkout"
        disabled={cart.length === 0}
        onClick={onCheckout}
      >
        Realizar pedido
      </button>
    </aside>
  );
}
