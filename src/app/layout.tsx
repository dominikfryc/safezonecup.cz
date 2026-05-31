import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "300 900",
});

export const metadata: Metadata = {
  title: "SAFEZONE CUP",
  description: "Official Tournament Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-sans", satoshi.variable)}
      style={{ scrollbarGutter: "stable" }}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
