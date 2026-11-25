import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BINAPANI | Contemporary Heritage Apparel & Luxury Tailoring",
    template: "%s | BINAPANI",
  },
  description:
    "Discover BINAPANI — architectural ready-to-wear apparel for women and men crafted in raw Tussar silk, European flax linen, and extra-fine merino wool.",
  keywords: [
    "BINAPANI",
    "luxury apparel",
    "contemporary heritage fashion",
    "raw silk trench coat",
    "linen tailoring",
    "menswear",
    "womenswear",
    "new arrivals",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "BINAPANI",
    title: "BINAPANI | Contemporary Heritage Apparel",
    description:
      "Architectural silhouettes in pure natural textiles. Shop Women, Men, and New Arrivals.",
    images: [{ url: "/images/hero-atelier.jpg", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BINAPANI | Contemporary Heritage Apparel",
    description:
      "Architectural silhouettes in pure natural textiles. Shop Women, Men, and New Arrivals.",
    images: ["/images/hero-atelier.jpg"],
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#141414]">
        <AuthProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
