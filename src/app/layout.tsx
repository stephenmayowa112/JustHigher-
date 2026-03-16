import type { Metadata, Viewport } from "next";
import StructuredData from "@/components/StructuredData";
import { generateDefaultMetadata, generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = generateDefaultMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = generateWebsiteJsonLd();
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="en" className="h-full">
      <head>
        <StructuredData data={websiteJsonLd} />
        <StructuredData data={organizationJsonLd} />
      </head>
      <body className="h-full bg-white text-gray-700 font-serif antialiased">
        {children}
      </body>
    </html>
  );
}
