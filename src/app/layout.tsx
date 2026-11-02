import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Orbenyx Workshop Billing",
  description: "Automobile Workshop Billing & Management Software",
  keywords: ["billing", "workshop", "automobile", "invoice", "GST"],
  authors: [{ name: "Orbenyx" }],
  creator: "Orbenyx",
  publisher: "Orbenyx",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Orbenyx Workshop Billing",
    description: "Automobile Workshop Billing & Management Software",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#17365D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}