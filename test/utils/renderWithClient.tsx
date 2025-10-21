import React, { ReactNode } from "react";
import { render } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { afterEach } from "vitest";

export function createTestQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache(),
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithClient(ui: ReactNode) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

afterEach(() => {
  const queryClient = createTestQueryClient();
  queryClient.clear();
});
