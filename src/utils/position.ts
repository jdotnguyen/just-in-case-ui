export type Placement = 'top' | 'bottom' | 'left' | 'right';

export const GAP = 8;
export const MARGIN = 8;
const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export interface Position {
  top: number;
  left: number;
  placement: Placement;
  arrow: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

function fits(placement: Placement, trigger: DOMRect, tip: DOMRect, gap: number) {
  switch (placement) {
    case 'top':
      return trigger.top - tip.height - gap >= MARGIN;
    case 'bottom':
      return trigger.bottom + tip.height + gap <= window.innerHeight - MARGIN;
    case 'left':
      return trigger.left - tip.width - gap >= MARGIN;
    case 'right':
      return trigger.right + tip.width + gap <= window.innerWidth - MARGIN;
  }
}

/** Picks a side (flipping if needed), clamps to the viewport, and returns fixed-position coordinates. */
export function computePosition(
  preferred: Placement,
  trigger: DOMRect,
  tip: DOMRect,
  gap: number = GAP,
  /** `start` lines the panel up with the trigger's leading edge instead of centring it. */
  align: 'center' | 'start' = 'center',
): Position {
  const placement =
    fits(preferred, trigger, tip, gap) || !fits(OPPOSITE[preferred], trigger, tip, gap)
      ? preferred
      : OPPOSITE[preferred];
  const centerX = trigger.left + trigger.width / 2;
  const centerY = trigger.top + trigger.height / 2;

  if (placement === 'top' || placement === 'bottom') {
    const wanted = align === 'start' ? trigger.left : centerX - tip.width / 2;
    const left = clamp(wanted, MARGIN, window.innerWidth - tip.width - MARGIN);
    return {
      placement,
      left,
      top: placement === 'top' ? trigger.top - tip.height - gap : trigger.bottom + gap,
      arrow: clamp(centerX - left, 14, tip.width - 14),
    };
  }
  const wantedTop = align === 'start' ? trigger.top : centerY - tip.height / 2;
  const top = clamp(wantedTop, MARGIN, window.innerHeight - tip.height - MARGIN);
  return {
    placement,
    top,
    left: placement === 'left' ? trigger.left - tip.width - gap : trigger.right + gap,
    arrow: clamp(centerY - top, 14, tip.height - 14),
  };
}

