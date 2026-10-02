// Cuadrícula de productos del terminal: tarjeta con ilustración, nombre,
// precio, cantidad en el pedido y botón "Añadir".
import DishVisual from './DishVisual';
import { formatPrice, type CartItem, type Dish } from '../data/menu';

interface Props {
  dishes: Dish[];
  cart: CartItem[];
  onAdd: (dish: Dish) => void;
  onQty: (dishId: string, delta: number) => void;
}

function qtyInCart(cart: CartItem[], dishId: string): number {
  return cart.find((i) => i.dish.id === dishId)?.qty ?? 0;
}

export default function ProductGrid({ dishes, cart, onAdd, onQty }: Props) {
  if (dishes.length === 0) {
    return (
      <div className="empty-grid">
        <p>No hay productos que coincidan con la búsqueda.</p>
      </div>
    );
  }
  return (
    <div className="product-grid">
      {dishes.map((dish) => {
        const qty = qtyInCart(cart, dish.id);
        return (
          <article key={dish.id} className="product-card">
            <div className="product-art" aria-hidden="true">
              <DishVisual kind={dish.visual} />
            </div>
            <div className="product-body">
              <div className="product-top">
                <h3 className="product-name">{dish.name}</h3>
                <span className="product-price">{formatPrice(dish.price)}</span>
              </div>
              <p className="product-desc">{dish.description}</p>
              <div className="product-actions">
                {qty === 0 ? (
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => onAdd(dish)}
                  >
                    Añadir
                  </button>
                ) : (
                  <div className="stepper">
                    <button
                      type="button"
                      aria-label={`Quitar uno de ${dish.name}`}
                      onClick={() => onQty(dish.id, -1)}
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      aria-label={`Añadir uno de ${dish.name}`}
                      onClick={() => onQty(dish.id, 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
