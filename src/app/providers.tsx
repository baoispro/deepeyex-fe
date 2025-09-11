"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { IntlProvider } from "next-intl";
import { store } from "./shares/stores";

interface Messages {
  [key: string]: string | Messages;
}

interface ProvidersProps {
  children: ReactNode;
  messages: Messages;
  locale: string;
}

export default function Providers({ children, messages, locale }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale} messages={messages}>
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
    </Provider>
  );
}
