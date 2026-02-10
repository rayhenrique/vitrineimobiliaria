export const BROKER_NAME = "Ezequias Alves Imóveis";
export const BROKER_CRED = "CRECI - AL 9384";
export const BROKER_PHONE_HUMAN = "+55 82 99198-1454";
export const BROKER_PHONE_WA = "5582991981454";

export const WHATSAPP_BASE_MESSAGE =
  "Ola, vi os imoveis em destaque e quero mais informacoes.";

export const PROPERTY_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PROPERTY_BUCKET ?? "property-images";

export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${BROKER_PHONE_WA}?text=${encodeURIComponent(message)}`;
}
