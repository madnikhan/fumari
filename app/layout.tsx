import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "@/components/Toast";
import InstallPrompt from "@/components/InstallPrompt";
import DemoTrademark from "@/components/DemoTrademark";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fumari Restaurant Management System",
  description: "Complete restaurant management system for large-scale operations",
  manifest: "/manifest.json",
  themeColor: "#9B4E3F",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fumari",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <ToastContainer />
        <InstallPrompt />
        <DemoTrademark />
      </body>
    </html>
  );
}
