import Link from "next/link";
import Image from "next/image";
import { Headset, House, Info, Landmark, Mail, MapPin, MessageCircle } from "lucide-react";
import { BROKER_CRED, BROKER_NAME, BROKER_PHONE_HUMAN } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Image
              src="/logo-ezequias.png"
              alt="Logo Ezequias Alves"
              width={100}
              height={100}
              className="h-[100px] w-[100px] object-contain"
            />
            <span>{BROKER_NAME}</span>
          </p>
          <p className="mt-2 text-sm text-secondary">
            {BROKER_CRED}
          </p>
        </div>
        <div className="text-sm text-secondary">
          <p className="font-semibold text-primary">Links rápidos</p>
          <p className="mt-2">
            <Link className="inline-flex items-center gap-1.5 hover:text-primary" href="/#inicio">
              <House className="h-4 w-4" />
              <span>Início</span>
            </Link>
          </p>
          <p>
            <Link className="inline-flex items-center gap-1.5 hover:text-primary" href="/#imoveis">
              <Landmark className="h-4 w-4" />
              <span>Imóveis</span>
            </Link>
          </p>
          <p>
            <Link className="inline-flex items-center gap-1.5 hover:text-primary" href="/#sobre">
              <Info className="h-4 w-4" />
              <span>Sobre</span>
            </Link>
          </p>
        </div>
        <div className="text-sm text-secondary">
          <p className="font-semibold text-primary">Contato</p>
          <p className="mt-2 inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>Teotônio Vilela, AL</span>
          </p>
          <p className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp: {BROKER_PHONE_HUMAN}</span>
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Mail className="h-4 w-4" />
            <span>ezequias.alves@creci.org.br</span>
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Headset className="h-4 w-4" />
            <span>Atendimento personalizado</span>
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-secondary">
        © 2026 {BROKER_NAME}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
