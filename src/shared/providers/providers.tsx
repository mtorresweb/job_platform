"use client";

import { type ReactNode } from "react";
import { IconContext } from "@phosphor-icons/react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <IconContext.Provider
          value={{ size: 22, weight: "duotone", color: "currentColor" }}
        >
          <QueryProvider>
            {children}
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </IconContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}
