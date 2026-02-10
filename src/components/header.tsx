import Link from "next/link";
import Image from "next/image";
import { House, Info, Landmark, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsappUrl, WHATSAPP_BASE_MESSAGE, BROKER_NAME } from "@/lib/site";

const whatsappLink = buildWhatsappUrl(WHATSAPP_BASE_MESSAGE);

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Image
            src="/logo-ezequias.png"
            alt="Logo Ezequias Alves"
            width={100}
            height={100}
            className="h-[100px] w-[100px] object-contain"
            priority
          />
          <span>{BROKER_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-secondary md:flex">
          <Link className="flex items-center gap-1.5 transition-colors duration-200 hover:text-primary" href="#inicio">
            <House className="h-4 w-4" />
            <span>Início</span>
          </Link>
          <Link className="flex items-center gap-1.5 transition-colors duration-200 hover:text-primary" href="#imoveis">
            <Landmark className="h-4 w-4" />
            <span>Imóveis</span>
          </Link>
          <Link className="flex items-center gap-1.5 transition-colors duration-200 hover:text-primary" href="#sobre">
            <Info className="h-4 w-4" />
            <span>Sobre</span>
          </Link>
        </nav>
        <Button
          asChild
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Link href={whatsappLink} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>WhatsApp</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
