import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Anything iTech Martha's Vineyard | iPhone, Mac & Network Services",
    template: "%s | Anything iTech Martha's Vineyard",
  },
  description: "Professional iPhone repair, Mac service, and network solutions on Martha's Vineyard. Certified technicians, same-day service, 15+ years experience. Call (508) 560-3510.",
  keywords: ["iPhone repair Martha's Vineyard", "Mac repair Martha's Vineyard", "network services Martha's Vineyard", "Apple repair", "tech support", "computer repair"],
  authors: [{ name: "Anything iTech Martha's Vineyard" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anythingitechmv.com",
    siteName: "Anything iTech Martha's Vineyard",
    title: "Anything iTech Martha's Vineyard | iPhone, Mac & Network Services",
    description: "Professional iPhone repair, Mac service, and network solutions on Martha's Vineyard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anything iTech Martha's Vineyard",
    description: "Professional iPhone repair, Mac service, and network solutions on Martha's Vineyard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/images/favicon.png" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
