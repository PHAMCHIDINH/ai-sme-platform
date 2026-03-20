"use client";

import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Home, Keyboard, SkipForward } from "lucide-react";

import { PresentationSlide } from "@/components/presentation/presentation-slide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type SlideAccent, type SlideDefinition } from "@/lib/presentation/slides";
import { cn } from "@/lib/utils";

type PresentationDeckProps = {
  slides: SlideDefinition[];
};

const DESKTOP_BREAKPOINT = 1024;
const SLIDE_BASE_WIDTH = 1600;
const SLIDE_BASE_HEIGHT = 900;
const DESKTOP_HORIZONTAL_GUTTER = 32;
const DESKTOP_VERTICAL_SAFE_ZONE = 140;

const DOT_ACCENTS: Record<SlideAccent, string> = {
  violet: "bg-violet-200",
  cyan: "bg-cyan-200",
  lime: "bg-lime-200",
  pink: "bg-pink-200",
  orange: "bg-orange-200",
  yellow: "bg-yellow-200",
};

export function PresentationDeck({ slides }: PresentationDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktopScale, setDesktopScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const mobileSlidesRef = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const updateScale = () => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);

      if (!desktop) {
        setDesktopScale(1);
        return;
      }

      const containerWidth = deckRef.current?.clientWidth ?? window.innerWidth;
      const availableWidth = Math.max(containerWidth - DESKTOP_HORIZONTAL_GUTTER * 2, 320);
      const availableHeight = Math.max(window.innerHeight - DESKTOP_VERTICAL_SAFE_ZONE, 240);
      const nextScale = Math.min(1, availableWidth / SLIDE_BASE_WIDTH, availableHeight / SLIDE_BASE_HEIGHT);

      setDesktopScale(nextScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const nextIndex = Number(visibleEntries[0].target.getAttribute("data-slide-index"));

        if (!Number.isNaN(nextIndex)) {
          setActiveIndex(nextIndex);
        }
      },
      {
        threshold: [0.58, 0.76],
        rootMargin: "-10% 0px -10% 0px",
      },
    );

    mobileSlidesRef.current.forEach((slideElement) => {
      if (slideElement) {
        observer.observe(slideElement);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [isDesktop, slides.length]);

  const goToSlide = useCallback((nextIndex: number, behavior: ScrollBehavior = "smooth") => {
    const clampedIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));
    setActiveIndex(clampedIndex);

    if (isDesktop) {
      return;
    }

    const targetSlide = mobileSlidesRef.current[clampedIndex];

    if (!targetSlide) {
      return;
    }

    targetSlide.scrollIntoView({
      behavior,
      block: "start",
    });
  }, [isDesktop, slides.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft" || (event.key === " " && event.shiftKey)) {
        event.preventDefault();
        goToSlide(activeIndex - 1);
        return;
      }

      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goToSlide(activeIndex + 1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        goToSlide(slides.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, goToSlide, isDesktop, slides.length]);

  const currentSlide = slides[activeIndex];

  return (
    <div ref={deckRef} className="relative min-h-[100dvh] overflow-hidden">
      {isDesktop ? (
        <DesktopDeck
          slides={slides}
          activeIndex={activeIndex}
          currentSlide={currentSlide}
          desktopScale={desktopScale}
          goToSlide={goToSlide}
        />
      ) : (
        <MobileDeck
          slides={slides}
          activeIndex={activeIndex}
          currentSlide={currentSlide}
          goToSlide={goToSlide}
          slideRefs={mobileSlidesRef}
        />
      )}
    </div>
  );
}

function DesktopDeck({
  slides,
  activeIndex,
  currentSlide,
  desktopScale,
  goToSlide,
}: {
  slides: SlideDefinition[];
  activeIndex: number;
  currentSlide: SlideDefinition;
  desktopScale: number;
  goToSlide: (nextIndex: number, behavior?: ScrollBehavior) => void;
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-4 pt-4">
        <div className="pointer-events-auto max-w-[62vw] rounded-full border-2 border-black bg-white/92 px-4 py-2 shadow-neo-sm backdrop-blur">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground/55">
            {currentSlide.sectionLabel} • {currentSlide.kicker}
          </p>
          <p className="truncate text-sm font-black text-foreground">{currentSlide.title}</p>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <Badge className="bg-yellow-200">
            {activeIndex + 1}/{slides.length}
          </Badge>
          <span className="hidden items-center gap-1.5 rounded-full border-2 border-black bg-white/92 px-3 py-1.5 text-xs font-semibold text-foreground/70 shadow-neo-sm backdrop-blur lg:inline-flex">
            <Keyboard className="h-3.5 w-3.5" />
            Arrow keys, Space, Home, End
          </span>
        </div>
      </div>

      <div className="relative flex h-[100dvh] items-center justify-center px-4 py-4">
        <div
          className="relative shrink-0"
          style={{
            width: `${SLIDE_BASE_WIDTH * desktopScale}px`,
            height: `${SLIDE_BASE_HEIGHT * desktopScale}px`,
          }}
        >
          <div
            key={currentSlide.id}
            style={{
              width: `${SLIDE_BASE_WIDTH}px`,
              height: `${SLIDE_BASE_HEIGHT}px`,
              transform: `scale(${desktopScale})`,
              transformOrigin: "top left",
            }}
          >
            <PresentationSlide slide={currentSlide} isActive />
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 px-4 pb-4">
        <div className="pointer-events-auto hidden items-center gap-2 rounded-full border-2 border-black bg-white/92 px-3 py-2 shadow-neo-sm backdrop-blur lg:flex">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Đến slide ${index + 1}`}
              className={cn(
                "h-2.5 w-2.5 rounded-full border border-black transition-transform duration-200",
                index === activeIndex
                  ? `${DOT_ACCENTS[currentSlide.accent]} scale-125`
                  : "bg-white/80 hover:scale-110",
              )}
            />
          ))}
        </div>

        <div className="pointer-events-auto ml-auto flex items-center gap-2 rounded-full border-2 border-black bg-white/92 px-2 py-2 shadow-neo-sm backdrop-blur">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => goToSlide(0)}
            disabled={activeIndex === 0}
            aria-label="Về slide đầu tiên"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => goToSlide(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Slide trước"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => goToSlide(activeIndex + 1)}
            disabled={activeIndex === slides.length - 1}
            aria-label="Slide tiếp theo"
          >
            <span className="hidden sm:inline">Tiếp</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => goToSlide(slides.length - 1)}
            disabled={activeIndex === slides.length - 1}
            aria-label="Đến slide cuối"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

function MobileDeck({
  slides,
  activeIndex,
  currentSlide,
  goToSlide,
  slideRefs,
}: {
  slides: SlideDefinition[];
  activeIndex: number;
  currentSlide: SlideDefinition;
  goToSlide: (nextIndex: number, behavior?: ScrollBehavior) => void;
  slideRefs: MutableRefObject<Array<HTMLElement | null>>;
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3">
        <div className="pointer-events-auto mx-auto flex items-center justify-between gap-3 rounded-[1rem] border-2 border-black bg-white/92 px-4 py-2 shadow-neo-sm backdrop-blur">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground/55">
              {currentSlide.sectionLabel} • {currentSlide.kicker}
            </p>
            <p className="truncate text-sm font-black">{currentSlide.title}</p>
          </div>
          <Badge className="bg-yellow-200">
            {activeIndex + 1}/{slides.length}
          </Badge>
        </div>
      </div>

      <main className="mx-auto flex min-h-[100dvh] max-w-[1700px] flex-col gap-3 px-3 pb-20 pt-16">
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            id={slide.id}
            data-slide-index={index}
            aria-label={`Slide ${index + 1}: ${slide.title}`}
            ref={(element) => {
              slideRefs.current[index] = element;
            }}
            className="relative flex min-h-[calc(100dvh-5.5rem)] items-center justify-center"
          >
            <PresentationSlide slide={slide} isActive={index === activeIndex} />
          </section>
        ))}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-3">
        <div className="pointer-events-auto mx-auto flex items-center justify-between gap-2 rounded-[1rem] border-2 border-black bg-white/92 px-3 py-2 shadow-neo-sm backdrop-blur">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToSlide(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Slide trước"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="truncate text-sm font-semibold text-foreground/78">{currentSlide.kicker}</span>
          <Button
            size="sm"
            onClick={() => goToSlide(activeIndex + 1)}
            disabled={activeIndex === slides.length - 1}
            aria-label="Slide tiếp theo"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}
