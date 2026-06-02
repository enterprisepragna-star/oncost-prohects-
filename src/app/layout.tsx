import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ONCOST | Premium Return Gifts",
    template: "%s | ONCOST",
  },
  description:
    "Curated return gifts and premium collections for birthdays, poojas, weddings, and celebrations. Bulk orders from 50 pieces with Pan India delivery.",
  keywords: ["return gifts", "bulk gifts", "pooja gifts", "birthday return gifts", "thambulam", "brass gifts"],
  openGraph: {
    siteName: "ONCOST",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
