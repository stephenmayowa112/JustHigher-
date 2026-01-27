import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";
import Analytics from "@/components/Analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustHigher Blog",
  description: "Ideas that elevate, inspire, and push you toward your potential",
  keywords: ["motivation", "growth", "inspiration", "personal development", "success"],
  authors: [{ name: "JustHigher Blog" }],
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
        
        {/* Analytics Component */}
        <Analytics />
      </body>
    </html>
  );
}
