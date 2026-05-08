import { useRef, useEffect, useCallback } from "react";

const ITEM_HEIGHT = 44; // px — touch target mínimo

export default function TimePicker({ slots, value, onChange, horariosOcupados = [], disabled = false }) {
  const listRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);

  // Snapeia no slot mais próximo ao parar o scroll
  const snapToNearest = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, slots.length - 1));
    el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
    if (!horariosOcupados.includes(slots[clamped])) {
      onChange(slots[clamped]);
    }
  }, [slots, onChange, horariosOcupados]);

  // Scroll para o valor selecionado quando muda externamente
  useEffect(() => {
    const el = listRef.current;
    if (!el || !value) return;
    const index = slots.indexOf(value);
    if (index >= 0) {
      el.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
    }
  }, [value, slots]);

  // Snap ao soltar o scroll nativo
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(snapToNearest, 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(timeout); };
  }, [snapToNearest]);

  return (
    <div className="tp-root" aria-label="Selecionar horário">
      {/* Faixas de opacidade topo/fundo */}
      <div className="tp-fade tp-fade-top" />
      <div className="tp-selector" />
      <div className="tp-fade tp-fade-bottom" />

      <ul
        ref={listRef}
        className="tp-list"
        role="listbox"
        aria-label="Horários disponíveis"
        style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}
      >
        {/* Padding topo e fundo para centralizar o primeiro/último item */}
        <li className="tp-spacer" aria-hidden="true" />

        {slots.map((slot) => {
          const ocupado = horariosOcupados.includes(slot);
          const ativo = value === slot;
          return (
            <li
              key={slot}
              role="option"
              aria-selected={ativo}
              aria-disabled={ocupado}
              className={`tp-item ${ativo ? "tp-item--active" : ""} ${ocupado ? "tp-item--ocupado" : ""}`}
              onClick={() => {
                if (ocupado) return;
                onChange(slot);
                const el = listRef.current;
                const index = slots.indexOf(slot);
                el?.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
              }}
            >
              <span className="tp-item-time">{slot}</span>
              {ocupado && <span className="tp-item-tag">ocupado</span>}
            </li>
          );
        })}

        <li className="tp-spacer" aria-hidden="true" />
      </ul>
    </div>
  );
}