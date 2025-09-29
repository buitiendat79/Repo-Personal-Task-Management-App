// src/test/TestProviders.tsx
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface TestProvidersProps {
  children: ReactNode;
}

export function TestProviders({ children }: TestProvidersProps) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
}
