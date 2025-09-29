import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./api/supabaseClient";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <App />
        </SessionContextProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
