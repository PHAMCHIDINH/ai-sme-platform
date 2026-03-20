import type { Metadata } from "next";

import { PresentationPrintDeck } from "@/components/presentation/presentation-print-deck";
import { resolvePresentationSlides } from "@/lib/presentation/resolve-slides";
import { presentationSlides } from "@/lib/presentation/slides";

export const metadata: Metadata = {
  title: "Nho Ti | Print deck",
  description: "Bản in PDF cho deck thuyết trình Nho Ti.",
};

export default function PresentationPrintPage() {
  const slides = resolvePresentationSlides(presentationSlides);

  return <PresentationPrintDeck slides={slides} />;
}
