import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ToastContainer from "../components/layout/ToastContainer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invenio — Inventory Management",
  description: "Private-banking black, champagne letterforms inventory portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} min-h-full flex flex-col bg-neutral text-primary antialiased`}
        suppressHydrationWarning
      >
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
