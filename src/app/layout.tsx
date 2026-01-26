import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minimalist Blog",
  description: "A modern, high-performance blog inspired by Seth Godin's minimalist design",
  keywords: ["blog", "minimalist", "writing", "thoughts"],
  authors: [{ name: "Blog Author" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-white text-gray-700 font-serif antialiased">
        <div className="min-h-full flex">
          {/* Sidebar Component */}
          <Sidebar />
          
          {/* Main Content Component */}
          <MainContent>
            {children}
          </MainContent>
        </div>
      </body>
    </html>
  );
}
