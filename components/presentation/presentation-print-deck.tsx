import { PresentationSlide } from "@/components/presentation/presentation-slide";
import { type SlideDefinition } from "@/lib/presentation/slides";

type PresentationPrintDeckProps = {
  slides: SlideDefinition[];
};

export function PresentationPrintDeck({ slides }: PresentationPrintDeckProps) {
  return (
    <main className="presentation-print-root">
      <div className="presentation-print-stack">
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            aria-label={`Slide ${index + 1}: ${slide.title}`}
            className="presentation-print-page"
          >
            <div className="presentation-print-sheet">
              <PresentationSlide slide={slide} index={index} isActive />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
