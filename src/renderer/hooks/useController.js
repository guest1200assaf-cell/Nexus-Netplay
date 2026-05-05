// ─── useController — Gamepad API polling ────────────────────────────────────
import { useEffect, useRef, useCallback } from 'react';

export const BUTTON_MAP = {
  0:  'cross',    // ✕
  1:  'circle',   // ○
  2:  'square',   // □
  3:  'triangle', // △
  4:  'l1',  5:  'r1',
  6:  'l2',  7:  'r2',
  8:  'share',  9: 'options',
  10: 'l3',    11: 'r3',
  12: 'up',    13: 'down',
  14: 'left',  15: 'right',
  16: 'ps',
};

const AXIS_DEADZONE = 0.12;

/**
 * Polls the Gamepad API at 60fps and fires `onInput` callbacks.
 *
 * @param {Function} onInput  - ({ button?, pressed?, value?, type?, lx?, ly?, rx?, ry? }) => void
 * @param {number}   [index]  - Gamepad index (default 0)
 */
export function useController(onInput, index = 0) {
  const frameRef       = useRef(null);
  const prevButtonsRef = useRef({});
  const prevAxesRef    = useRef({});
  const onInputRef     = useRef(onInput);

  useEffect(() => { onInputRef.current = onInput; }, [onInput]);

  const poll = useCallback(() => {
    const gp = navigator.getGamepads()[index];

    if (gp) {
      // ── Buttons ────────────────────────────────────────────────────────
      gp.buttons.forEach((btn, i) => {
        const name = BUTTON_MAP[i];
        if (!name) return;
        const was = prevButtonsRef.current[name] ?? false;
        if (btn.pressed !== was) {
          onInputRef.current?.({ button: name, pressed: btn.pressed, value: btn.value });
          prevButtonsRef.current[name] = btn.pressed;
        }
      });

      // ── Axes ───────────────────────────────────────────────────────────
      const axes = {
        lx: Math.abs(gp.axes[0]) > AXIS_DEADZONE ? gp.axes[0] : 0,
        ly: Math.abs(gp.axes[1]) > AXIS_DEADZONE ? gp.axes[1] : 0,
        rx: Math.abs(gp.axes[2]) > AXIS_DEADZONE ? gp.axes[2] : 0,
        ry: Math.abs(gp.axes[3]) > AXIS_DEADZONE ? gp.axes[3] : 0,
      };
      const prev = prevAxesRef.current;
      if (axes.lx !== prev.lx || axes.ly !== prev.ly || axes.rx !== prev.rx || axes.ry !== prev.ry) {
        onInputRef.current?.({ type: 'axes', ...axes });
        prevAxesRef.current = axes;
      }
    }

    frameRef.current = requestAnimationFrame(poll);
  }, [index]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frameRef.current);
  }, [poll]);
}
