"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { IntlProvider } from "next-intl";
import { persistor, store } from "./shares/stores";
import { PersistGate } from "redux-persist/integration/react";
import { queryClient } from "./shares/configs/queryClient";
import { SocketInitializer } from "./shares/components/SocketInitializer";

interface Messages {
  [key: string]: string | Messages;
}

interface ProvidersProps {
  children: ReactNode;
  messages: Messages;
  locale: string;
}

export default function Providers({ children, messages, locale }: ProvidersProps) {
  // const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider locale={locale} messages={messages}>
            <SocketInitializer />
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />
          </IntlProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
