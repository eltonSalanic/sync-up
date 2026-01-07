import type { Metadata } from "next";
import { Poppins, DM_Sans, Roboto_Mono} from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: "400",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sync Up",
  description: "Easily coordinate plans with anyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${dmSans.variable} ${robotoMono.variable} antialiased bg-background`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
