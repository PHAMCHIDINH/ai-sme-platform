import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/app-providers";

const geist = Inter({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Kết nối Sinh viên và SME",
  description: "Nền tảng AI giúp SME đăng bài toán thực chiến và ghép cặp sinh viên phù hợp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${geist.variable} ${spaceGrotesk.variable}`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
