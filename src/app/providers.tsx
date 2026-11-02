"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#16803C",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#B42318",
              secondary: "#fff",
            },
          },
        }}
      />
    </SessionProvider>
  );
}