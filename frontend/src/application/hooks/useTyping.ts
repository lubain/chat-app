import { useRef, useCallback } from "react";
import { getSocket } from "@/infrastructure/socket/socket-client";

/**
 * Hook à utiliser dans MessageInput.
 * Gère l'émission des événements typing:start / typing:stop.
 *
 * Logique :
 * - Au premier keystroke → émet typing:start
 * - Chaque keystroke remet le timer à zéro (debounce)
 * - Si l'utilisateur s'arrête 2s → émet typing:stop automatiquement
 * - Quand le message est envoyé → émet typing:stop immédiatement
 */
export function useTyping(conversationId: string | null) {
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const STOP_DELAY = 2000; // ms

  const emitStart = useCallback(() => {
    if (!conversationId) return;
    try {
      getSocket().emit("typing:start", { conversationId });
    } catch {
      /* socket not connected */
    }
  }, [conversationId]);

  const emitStop = useCallback(() => {
    if (!conversationId) return;
    try {
      getSocket().emit("typing:stop", { conversationId });
    } catch {
      /* socket not connected */
    }
  }, [conversationId]);

  /** À appeler à chaque onChange du textarea */
  const onKeystroke = useCallback(() => {
    // Démarrer si pas encore en train d'écrire
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitStart();
    }

    // Remettre le timer à zéro
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitStop();
    }, STOP_DELAY);
  }, [emitStart, emitStop]);

  /** À appeler quand le message est envoyé */
  const onMessageSent = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emitStop();
    }
  }, [emitStop]);

  return { onKeystroke, onMessageSent };
}
