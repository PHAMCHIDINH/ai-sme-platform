import type { Metadata } from "next";

import { PresentationDeck } from "@/components/presentation/presentation-deck";
import { resolvePresentationSlides } from "@/lib/presentation/resolve-slides";
import { presentationSlides } from "@/lib/presentation/slides";

export const metadata: Metadata = {
  title: "Nho Ti | Slide thuyết trình",
  description:
    "Deck thuyết trình Nho Ti: nền tảng AI kết nối sinh viên với doanh nghiệp SME qua các micro-project thực tế.",
};

export default function PresentationPage() {
  const slides = resolvePresentationSlides(presentationSlides);

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,255,255,0.92))]">
      <div className="pointer-events-none absolute inset-0 bg-neo-grid bg-grid opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,166,255,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(166,250,255,0.22),transparent_26%),radial-gradient(circle_at_bottom_center,rgba(255,198,159,0.18),transparent_26%)]" />
      <PresentationDeck slides={slides} />
    </div>
  );
}
