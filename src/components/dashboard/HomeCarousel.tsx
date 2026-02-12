import { ReactNode, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface HomeCarouselProps {
  children: ReactNode[];
}

export function HomeCarousel({ children }: HomeCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="px-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {children.map((child, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%] px-1">
              {child}
            </div>
          ))}
        </div>
      </div>
      {/* Dots */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="h-2 w-2 rounded-full transition-all"
            style={{
              background: i === selected ? "hsl(var(--brand-blue))" : "hsl(var(--muted-foreground) / 0.3)",
              width: i === selected ? 20 : 8,
            }}
          />
        ))}
      </div>
    </div>
  );
}
