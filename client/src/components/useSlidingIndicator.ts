// Hook para el indicador "liquid glass" de la navegación tipo píldora.
// Mide la pestaña activa (offsetLeft/offsetTop/offsetWidth/offsetHeight
// relativos al contenedor) y expone el rectángulo para posicionar un
// indicador absoluto que se desliza con transición CSS. Re-mide al montar,
// al cambiar la pestaña activa y en cada resize (ResizeObserver + window).
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export interface IndicatorRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const EMPTY: IndicatorRect = { x: 0, y: 0, w: 0, h: 0 };

export function useSlidingIndicator<T extends HTMLElement>(activeKey: string) {
  const containerRef = useRef<T | null>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [rect, setRect] = useState<IndicatorRect>(EMPTY);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const el = itemRefs.current.get(activeKey);
    if (!container || !el) return;
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== container) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setRect((prev) =>
      prev.x === x && prev.y === y && prev.w === w && prev.h === h
        ? prev
        : { x, y, w, h },
    );
  }, [activeKey]);

  const setItemRef = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(key, el);
      else itemRefs.current.delete(key);
    },
    [],
  );

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [measure]);

  return { containerRef, setItemRef, rect };
}
