"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = EmblaCarouselType | undefined;

type CarouselProps = {
  opts?: EmblaOptionsType;
  className?: string;
  children: React.ReactNode;
};

const CarouselContext = React.createContext<{
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
} | null>(null);

function Carousel({ opts, className, children }: CarouselProps) {
  const [viewportRef, api] = useEmblaCarousel(opts);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  return (
    <CarouselContext.Provider value={{ api, scrollPrev, scrollNext }}>
      <div className={cn("relative", className)}>
        <div className="overflow-hidden" ref={viewportRef}>
          <div className="flex">{children}</div>
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselItem({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0 flex-[0_0_100%]", className)}>
      {children}
    </div>
  );
}

function CarouselPrevious({ className }: { className?: string }) {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("absolute left-3 top-1/2 -translate-y-1/2", className)}
      onClick={ctx.scrollPrev}
      aria-label="Imagem anterior"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
}

function CarouselNext({ className }: { className?: string }) {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("absolute right-3 top-1/2 -translate-y-1/2", className)}
      onClick={ctx.scrollNext}
      aria-label="Próxima imagem"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}

export { Carousel, CarouselItem, CarouselPrevious, CarouselNext };
