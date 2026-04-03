import type { Metadata } from "next";
import { Poppins, DM_Sans, Roboto_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layouts/header";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Are You Free",
  description:
    "Stop the group-chat ping-pong. Find when everyone's free — areyoufree.xyz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex flex-col min-h-screen ${poppins.variable} ${dmSans.variable} ${robotoMono.variable} antialiased bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
