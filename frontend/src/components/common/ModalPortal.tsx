import { createPortal } from 'react-dom';
import { ReactNode } from 'react';

/**
 * ModalPortal - renders children directly into document.body via React portal.
 * This completely bypasses any overflow/transform/stacking context issues
 * caused by parent containers (like the DashboardLayout's overflow-y-auto main).
 * Modals rendered through this will always cover the FULL viewport.
 */
export const ModalPortal = ({ children }: { children: ReactNode }) => {
  return createPortal(children, document.body);
};
