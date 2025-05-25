"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 5 minutos por defecto
            staleTime: 1000 * 60 * 5, // Reintenta 3 veces en caso de error
            retry: (failureCount, error: unknown) => {
              // No reintentar en errores 404 o 403
              if (error && typeof error === "object" && "status" in error) {
                const statusError = error as { status: number };
                if (statusError.status === 404 || statusError.status === 403) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            // Refetch cuando la ventana vuelve a estar en foco
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Reintenta las mutaciones una vez
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
