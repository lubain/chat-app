import { useState, useEffect, useRef, useCallback } from "react";
import {
  usersApi,
  UserSearchResult,
} from "@/infrastructure/api/conversation.api";

interface UseUserSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: UserSearchResult[];
  isLoading: boolean;
  error: string | null;
  clear: () => void;
}

/**
 * Live-search hook with debounce + request cancellation.
 * Cancels previous in-flight request when the query changes.
 */
export function useUserSearch(debounceMs = 300): UseUserSearchResult {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to cancel previous in-flight request
  const cancelRef = useRef<(() => void) | null>(null);

  const search = useCallback(async (q: string) => {
    // Cancel any previous pending request
    cancelRef.current?.();

    if (!q.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { promise, cancel } = usersApi.searchCancellable(q);
    cancelRef.current = cancel;

    try {
      const data = await promise;
      setResults(data);
    } catch (err: any) {
      // Ignore abort errors (user kept typing)
      if (err?.code !== "ERR_CANCELED" && err?.name !== "AbortError") {
        setError("Recherche impossible. Réessayez.");
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce: wait for user to stop typing before firing
  useEffect(() => {
    const timer = setTimeout(() => search(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, search, debounceMs]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      cancelRef.current?.();
    },
    []
  );

  const clear = useCallback(() => {
    cancelRef.current?.();
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return { query, setQuery, results, isLoading, error, clear };
}
