import Image from "next/image";
import { Bath, Bed, Car, Ruler } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PropertyCardProps = {
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

export function PropertyCard({
  title,
  propertyType,
  neighborhood,
  city,
  price,
  image,
  specs,
  status = "active"
}: PropertyCardProps) {
  const statusLabel =
    status === "sold" ? "Vendido" : status === "reserved" ? "Reservado" : "Destaque";

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-52 w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <Badge
          variant={status === "active" ? "accent" : "default"}
          className="absolute left-4 top-4"
        >
          {statusLabel}
        </Badge>
      </div>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-secondary">
            {neighborhood} · {city}
          </p>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {propertyType ? (
            <p className="text-xs uppercase tracking-wide text-secondary">
              {propertyType}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" /> {specs.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" /> {specs.baths}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-4 w-4" /> {specs.size} m²
          </span>
          <span className="flex items-center gap-1">
            <Car className="h-4 w-4" /> {specs.parking}
          </span>
        </div>
        <p className="text-lg font-semibold text-primary">{price}</p>
      </CardContent>
    </Card>
  );
}
