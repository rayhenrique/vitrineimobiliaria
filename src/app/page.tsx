import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/property-card";
import { featuredProperties, soldProperties } from "@/lib/mock-data";
import { Handshake, Search, Star, ShieldCheck, Sparkles } from "lucide-react";
import { buildWhatsappUrl } from "@/lib/site";

const whatsappLink = buildWhatsappUrl(
  "Ola, vi os imoveis em destaque e quero mais informacoes."
);
export const dynamic = "force-dynamic";

type HomeProperty = {
  id: string;
  title: string;
  propertyType?: string;
  neighborhood: string;
  city: string;
  price: string;
  image: string;
  specs: {
    beds: number;
    baths: number;
    size: number;
    parking: number;
  };
  status?: "active" | "sold" | "reserved";
};

type DbProperty = {
  id: string;
  title: string;
  property_type: string | null;
  price: number;
  city: string;
  neighborhood: string;
  specs: {
    beds?: number;
    baths?: number;
    size?: number;
    parking?: number;
  } | null;
  images: string[] | null;
  status: "active" | "sold" | "reserved";
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(price);
}

function mapDbPropertyToHomeCard(property: DbProperty): HomeProperty {
  return {
    id: property.id,
    title: property.title,
    propertyType: property.property_type ?? undefined,
    neighborhood: property.neighborhood,
    city: property.city,
    price: formatPrice(Number(property.price)),
    image:
      property.images?.[0] ??
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1600&auto=format&fit=crop",
    specs: {
      beds: property.specs?.beds ?? 0,
      baths: property.specs?.baths ?? 0,
      size: property.specs?.size ?? 0,
      parking: property.specs?.parking ?? 0
    },
    status: property.status
  };
}

function mapDbPropertyToSoldCard(property: DbProperty) {
  return {
    id: property.id,
    title: property.title,
    neighborhood: property.neighborhood,
    price: "Vendido",
    image:
      property.images?.[0] ??
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop"
  };
}

async function getHomeData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    const cities = Array.from(new Set(featuredProperties.map((item) => item.city))).sort();
    const propertyTypes = Array.from(
      new Set(
        featuredProperties
          .map((item) => item.propertyType)
          .filter((value): value is string => Boolean(value))
      )
    ).sort();

    return {
      featured: featuredProperties,
      sold: soldProperties,
      cities,
      propertyTypes
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const [
    { data: activeData, error: activeError },
    { data: soldData, error: soldError },
    { data: optionsData, error: optionsError }
  ] =
    await Promise.all([
      supabase
        .from("properties")
        .select("id, title, property_type, price, city, neighborhood, specs, images, status")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("properties")
        .select("id, title, property_type, price, city, neighborhood, specs, images, status")
        .eq("status", "sold")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("properties")
        .select("city, property_type")
        .eq("status", "active")
    ]);

  if (activeError || soldError || optionsError) {
    console.error("Erro ao carregar propriedades da home:", {
      activeError: activeError?.message,
      soldError: soldError?.message,
      optionsError: optionsError?.message
    });
    return {
      featured: [],
      sold: [],
      cities: [],
      propertyTypes: []
    };
  }

  const featured = ((activeData as DbProperty[]) ?? []).map(mapDbPropertyToHomeCard);
  const sold = ((soldData as DbProperty[]) ?? []).map(mapDbPropertyToSoldCard);
  const optionRows = (optionsData as Array<{ city: string; property_type: string | null }>) ?? [];
  const cities = Array.from(new Set(optionRows.map((row) => row.city).filter(Boolean))).sort();
  const propertyTypes = Array.from(
    new Set(optionRows.map((row) => row.property_type).filter(Boolean) as string[])
  ).sort();

  return {
    featured,
    sold,
    cities,
    propertyTypes
  };
}
type HomePageProps = {
  searchParams: Promise<{
    city?: string;
    type?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedCity = params.city?.trim() ?? "";
  const selectedType = params.type?.trim() ?? "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

  let featured: HomeProperty[] = [];
  let sold: Array<{ id: string; title: string; neighborhood: string; price: string; image: string }> = [];
  let cities: string[] = [];
  let propertyTypes: string[] = [];

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    let featuredQuery = supabase
      .from("properties")
      .select("id, title, property_type, price, city, neighborhood, specs, images, status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(12);

    if (selectedCity) {
      featuredQuery = featuredQuery.eq("city", selectedCity);
    }
    if (selectedType) {
      featuredQuery = featuredQuery.eq("property_type", selectedType);
    }

    const [
      { data: activeData, error: activeError },
      { data: soldData, error: soldError },
      { data: optionsData, error: optionsError }
    ] = await Promise.all([
      featuredQuery,
      supabase
        .from("properties")
        .select("id, title, property_type, price, city, neighborhood, specs, images, status")
        .eq("status", "sold")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("properties")
        .select("city, property_type")
        .eq("status", "active")
    ]);

    if (!activeError && !soldError && !optionsError) {
      featured = ((activeData as DbProperty[]) ?? []).map(mapDbPropertyToHomeCard);
      sold = ((soldData as DbProperty[]) ?? []).map(mapDbPropertyToSoldCard);
      const optionRows =
        (optionsData as Array<{ city: string; property_type: string | null }>) ?? [];
      cities = Array.from(new Set(optionRows.map((row) => row.city).filter(Boolean))).sort();
      propertyTypes = Array.from(
        new Set(optionRows.map((row) => row.property_type).filter(Boolean) as string[])
      ).sort();
    }
  }

  if (!supabaseUrl || !supabaseKey || (featured.length === 0 && sold.length === 0)) {
    const fallback = await getHomeData();
    featured = fallback.featured;
    sold = fallback.sold;
    cities = fallback.cities;
    propertyTypes = fallback.propertyTypes;
  }

  return (
    <main>
      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=2000&auto=format&fit=crop"
            alt="Interior de imóvel de alto padrão"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/60" />
        </div>
        <div className="relative mx-auto flex min-h-[75vh] max-w-6xl flex-col justify-center gap-8 px-6 py-20 text-white">
          <Badge variant="accent" className="w-fit text-white">
            Vitrine Imobiliária de Autoridade
          </Badge>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Imóveis exclusivos em Alagoas para quem busca alto padrão e segurança.
            </h1>
            <p className="text-base text-white/80 md:text-lg">
              Curadoria personalizada, atendimento próximo e acesso rápido ao melhor
              portfólio da cidade.
            </p>
          </div>
          <form
            action="/"
            method="get"
            className="rounded-2xl bg-white/95 p-6 text-primary shadow-soft backdrop-blur"
          >
            <p className="text-sm font-semibold text-secondary">
              Encontre o imóvel ideal em segundos
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <select
                name="city"
                defaultValue={selectedCity}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todas as cidades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <select
                name="type"
                defaultValue={selectedType}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todos os tipos</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Button type="submit" className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" />
                <span>Buscar</span>
              </Button>
            </div>
          </form>
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
            <span>Consultoria exclusiva</span>
            <span>Fotos premium</span>
            <span>Contato direto via WhatsApp</span>
          </div>
        </div>
      </section>

      <section id="imoveis" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Destaques</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Imóveis selecionados para investidores exigentes
            </h2>
          </div>
          <Button variant="outline" asChild>
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              <Handshake className="mr-2 h-4 w-4" />
              <span>Quero atendimento</span>
            </a>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featured.map((property) => (
            <Link
              key={property.id}
              href={`/imoveis/${property.id}`}
              className="block transition-transform hover:-translate-y-0.5"
            >
              <PropertyCard {...property} />
            </Link>
          ))}
        </div>
      </section>

      <section id="sobre" className="section-muted">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3">
          {[
            {
              title: "Curadoria especializada",
              description:
                "Portfólio enxuto com imóveis avaliados pessoalmente para cada perfil.",
              icon: Sparkles
            },
            {
              title: "Atendimento personalizado",
              description:
                "Acompanhamento consultivo do primeiro contato até a assinatura.",
              icon: Star
            },
            {
              title: "Segurança jurídica",
              description:
                "Processos transparentes com apoio de especialistas locais.",
              icon: ShieldCheck
            }
          ].map((item) => (
            <Card key={item.title} className="border-none bg-white">
              <CardContent className="space-y-4">
                <item.icon className="h-8 w-8 text-accent" />
                <h3 className="text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-secondary">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Prova social</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Imóveis vendidos recentemente
            </h2>
          </div>
          <Badge variant="default">100% satisfação</Badge>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {sold.map((property) => (
            <Link
              key={property.id}
              href={`/imoveis/${property.id}`}
              className="block transition-transform hover:-translate-y-0.5"
            >
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <Badge className="absolute left-4 top-4">Vendido</Badge>
                </div>
                <CardContent className="space-y-2">
                  <p className="text-sm text-secondary">{property.neighborhood}</p>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {property.title}
                  </h3>
                  <p className="text-sm text-secondary">{property.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
