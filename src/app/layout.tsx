import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BROKER_NAME } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta"
});

export const metadata: Metadata = {
  title: `${BROKER_NAME} | Vitrine Imobiliária`,
  description:
    "Imoveis de alto padrao em Alagoas com curadoria exclusiva e atendimento personalizado."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={jakarta.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
