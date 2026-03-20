import Image from "next/image";
import { FileImage, ImagePlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { type SlideVisual } from "@/lib/presentation/slides";
import { cn } from "@/lib/utils";

const RATIO_CLASSES: Record<SlideVisual["ratio"], string> = {
  "4:5": "aspect-[4/5]",
  "16:10": "aspect-[16/10]",
  "16:9": "aspect-[16/9]",
  square: "aspect-square",
};

type AccentStyle = {
  badge: string;
  chip: string;
  panel: string;
  soft: string;
  strong: string;
  line: string;
};

type PresentationVisualProps = {
  visual: SlideVisual;
  accent: AccentStyle;
  className?: string;
  priority?: boolean;
};

export function PresentationVisual({
  visual,
  accent,
  className,
  priority = false,
}: PresentationVisualProps) {
  return (
    <figure className={cn("overflow-hidden rounded-[1.5rem] border-2 border-black bg-white shadow-neo-md", className)}>
      <div className={cn("relative", RATIO_CLASSES[visual.ratio])}>
        {visual.src ? (
          <>
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              priority={priority}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(17,17,17,0.14)_100%)]" />
          </>
        ) : (
          <div className={cn("absolute inset-0", accent.soft)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_26%),linear-gradient(135deg,rgba(17,17,17,0.04)_25%,transparent_25%,transparent_50%,rgba(17,17,17,0.04)_50%,rgba(17,17,17,0.04)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
            <div className="relative flex h-full flex-col justify-between gap-4 p-4 md:p-5">
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <Badge className={accent.badge}>
                  <ImagePlus className="h-3.5 w-3.5" />
                  Ảnh cần bổ sung
                </Badge>
                <div className="mt-4 space-y-2">
                  <p className="text-xl font-black leading-snug md:text-[1.65rem]">{visual.placeholderLabel}</p>
                  <p className="mx-auto max-w-xl text-sm font-semibold leading-relaxed text-foreground/70 md:text-[1rem]">
                    {visual.caption ?? visual.alt}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <InfoChip label="File" value={visual.assetPath ?? "Chưa gán"} accent={accent} />
                <InfoChip label="Ratio" value={visual.ratio} accent={accent} />
                <InfoChip label="Size" value={`${visual.idealSize} | min ${visual.minimumSize}`} accent={accent} />
              </div>
            </div>
          </div>
        )}
      </div>

      <figcaption className="flex items-start gap-3 border-t-2 border-black bg-white px-4 py-2.5 md:px-5">
        <span className={cn("inline-flex rounded-xl border-2 border-black p-2 shadow-neo-sm", accent.chip)}>
          <FileImage className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black leading-snug text-foreground md:text-[1rem]">
            {visual.title ?? visual.placeholderLabel}
          </p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground/70 md:text-[0.95rem]">
            {visual.caption ?? visual.alt}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

function InfoChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: AccentStyle;
}) {
  return (
    <div className={cn("rounded-xl border-2 border-black px-3 py-2 shadow-neo-sm", accent.chip)}>
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-foreground/55">{label}</p>
      <p className="mt-1 break-all text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}
