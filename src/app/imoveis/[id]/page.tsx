import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Bath, Bed, Car, Ruler } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { buildWhatsappUrl } from "@/lib/site";
import { featuredProperties } from "@/lib/mock-data";

type DbProperty = {
  id: string;
  title: string;
  property_type: string | null;
  description: string;
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

type PropertyDetails = {
  id: string;
  title: string;
  propertyType?: string;
  description: string;
  price: string;
  city: string;
  neighborhood: string;
  specs: {
    beds: number;
    baths: number;
    size: number;
    parking: number;
  };
  images: string[];
  status: "active" | "sold" | "reserved";
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(price);
}

function mapDbProperty(property: DbProperty): PropertyDetails {
  return {
    id: property.id,
    title: property.title,
    propertyType: property.property_type ?? undefined,
    description: property.description,
    price: formatPrice(Number(property.price)),
    city: property.city,
    neighborhood: property.neighborhood,
    specs: {
      beds: property.specs?.beds ?? 0,
      baths: property.specs?.baths ?? 0,
      size: property.specs?.size ?? 0,
      parking: property.specs?.parking ?? 0
    },
    images:
      property.images && property.images.length > 0
        ? property.images
        : [
            "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1600&auto=format&fit=crop"
          ],
    status: property.status
  };
}

function getStatusLabel(status: PropertyDetails["status"]) {
  if (status === "sold") return "Vendido";
  if (status === "reserved") return "Reservado";
  return "Disponivel";
}

async function getPropertyById(id: string): Promise<PropertyDetails | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    const mock = featuredProperties.find((item) => item.id === id);
    if (!mock) return null;

    return {
      id: mock.id,
      title: mock.title,
      propertyType: mock.propertyType,
      description:
        "Imovel de alto padrao com curadoria exclusiva. Entre em contato para informacoes completas e agendamento de visita.",
      price: mock.price,
      city: mock.city,
      neighborhood: mock.neighborhood,
      specs: mock.specs,
      images: [mock.image],
      status: "active"
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("properties")
    .select("id, title, property_type, description, price, city, neighborhood, specs, images, status")
    .eq("id", id)
    .in("status", ["active", "sold", "reserved"])
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDbProperty(data as DbProperty);
}

export default async function PropertyDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const whatsappUrl = buildWhatsappUrl(
    `Ola, vi o imovel ${property.title} em ${property.neighborhood}, ${property.city} e tenho interesse.`
  );

  return (
    <main className="section-muted min-h-[70vh] px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Badge variant={property.status === "active" ? "accent" : "default"}>
            {getStatusLabel(property.status)}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {property.title}
          </h1>
          {property.propertyType ? (
            <p className="text-xs uppercase tracking-wide text-secondary">
              {property.propertyType}
            </p>
          ) : null}
          <p className="text-sm text-secondary">
            {property.neighborhood} - {property.city}
          </p>
          <p className="text-2xl font-semibold text-primary">{property.price}</p>
        </div>

        <Carousel className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          {property.images.map((image, index) => (
            <CarouselItem key={`${property.id}-${index}`}>
              <div className="relative h-[320px] w-full md:h-[500px]">
                <Image
                  src={image}
                  alt={`${property.title} - imagem ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Bed className="mx-auto mb-2 h-5 w-5 text-accent" />
              <p className="text-sm text-secondary">Quartos</p>
              <p className="text-lg font-semibold">{property.specs.beds}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Bath className="mx-auto mb-2 h-5 w-5 text-accent" />
              <p className="text-sm text-secondary">Banheiros</p>
              <p className="text-lg font-semibold">{property.specs.baths}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Ruler className="mx-auto mb-2 h-5 w-5 text-accent" />
              <p className="text-sm text-secondary">Area</p>
              <p className="text-lg font-semibold">{property.specs.size} m²</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Car className="mx-auto mb-2 h-5 w-5 text-accent" />
              <p className="text-sm text-secondary">Vagas</p>
              <p className="text-lg font-semibold">{property.specs.parking}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="text-xl font-semibold tracking-tight">Descricao do imovel</h2>
            <p className="text-secondary">{property.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          asChild
          className="h-12 bg-emerald-600 px-6 text-white shadow-soft hover:bg-emerald-700"
        >
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            Tenho interesse
          </a>
        </Button>
      </div>
    </main>
  );
}
