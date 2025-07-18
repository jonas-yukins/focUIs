import type { Metadata } from "next";
import { Inter, Montserrat, Lato } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const lato = Lato({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
      title: "focUIs - Transform Your Smartphone",
    description: "Transform your smartphone into a minimalist device. Reduce screen time with our focUIs app that replaces colorful icons with simple text.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, montserrat.variable, lato.variable)}>
      <body className={cn(inter.className, "antialiased")}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
