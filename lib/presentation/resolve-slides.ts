import { existsSync } from "fs";
import { join } from "path";

import { type SlideDefinition, type SlideVisual } from "@/lib/presentation/slides";

export function resolvePresentationSlides(slides: SlideDefinition[]): SlideDefinition[] {
  return slides.map((slide) => ({
    ...slide,
    visual: resolveVisual(slide.visual),
    visuals: slide.visuals?.map((visual) => resolveVisual(visual)),
  }));
}

function resolveVisual(visual: SlideVisual): SlideVisual;
function resolveVisual(visual?: SlideVisual): SlideVisual | undefined;
function resolveVisual(visual?: SlideVisual) {
  if (!visual?.assetPath) {
    return visual;
  }

  const assetPath = visual.assetPath.replace(/^\//, "");
  const absolutePath = join(process.cwd(), "public", assetPath);

  if (!existsSync(absolutePath)) {
    return visual;
  }

  return {
    ...visual,
    src: visual.assetPath,
  };
}
