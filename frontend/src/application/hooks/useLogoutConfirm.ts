import { useState, useCallback } from "react";

interface UseLogoutConfirmResult {
  isOpen: boolean;
  requestLogout: () => void;   // Ouvre la modale
  confirmLogout: () => void;   // Confirme → appelle onLogout
  cancelLogout: () => void;    // Ferme sans déconnecter
}

/**
 * Gère l'état de la modale de confirmation de déconnexion.
 *
 * Usage :
 *   const { isOpen, requestLogout, confirmLogout, cancelLogout } =
 *     useLogoutConfirm(handleLogout);
 */
export function useLogoutConfirm(onLogout: () => void): UseLogoutConfirmResult {
  const [isOpen, setIsOpen] = useState(false);

  const requestLogout = useCallback(() => setIsOpen(true), []);
  const cancelLogout = useCallback(() => setIsOpen(false), []);

  const confirmLogout = useCallback(() => {
    setIsOpen(false);
    onLogout();
  }, [onLogout]);

  return { isOpen, requestLogout, confirmLogout, cancelLogout };
}
