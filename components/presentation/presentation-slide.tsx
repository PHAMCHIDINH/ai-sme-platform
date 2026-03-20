import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Target,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";

import { BrandLogo } from "@/components/branding/brand-logo";
import { PresentationVisual } from "@/components/presentation/presentation-visual";
import { Badge } from "@/components/ui/badge";
import {
  type SlideAccent,
  type SlideCard,
  type SlideDefinition,
  type SlideDiagram,
  type SlideMatrixItem,
  type SlideRoadmapPhase,
  type SlideStat,
  type SlideStep,
} from "@/lib/presentation/slides";
import { cn } from "@/lib/utils";

type AccentStyle = {
  badge: string;
  chip: string;
  panel: string;
  soft: string;
  strong: string;
  line: string;
};

const ACCENT_STYLES: Record<SlideAccent, AccentStyle> = {
  violet: {
    badge: "bg-violet-200",
    chip: "bg-violet-200/80",
    panel: "bg-violet-100/60",
    soft: "bg-violet-100/35",
    strong: "bg-violet-200",
    line: "bg-violet-300",
  },
  cyan: {
    badge: "bg-cyan-200",
    chip: "bg-cyan-200/80",
    panel: "bg-cyan-200/35",
    soft: "bg-cyan-200/20",
    strong: "bg-cyan-200",
    line: "bg-cyan-300",
  },
  lime: {
    badge: "bg-lime-200",
    chip: "bg-lime-200/80",
    panel: "bg-lime-200/35",
    soft: "bg-lime-200/20",
    strong: "bg-lime-200",
    line: "bg-lime-300",
  },
  pink: {
    badge: "bg-pink-200",
    chip: "bg-pink-200/80",
    panel: "bg-pink-200/35",
    soft: "bg-pink-200/20",
    strong: "bg-pink-200",
    line: "bg-pink-300",
  },
  orange: {
    badge: "bg-orange-200",
    chip: "bg-orange-200/80",
    panel: "bg-orange-200/35",
    soft: "bg-orange-200/20",
    strong: "bg-orange-200",
    line: "bg-orange-300",
  },
  yellow: {
    badge: "bg-yellow-200",
    chip: "bg-yellow-200/80",
    panel: "bg-yellow-200/35",
    soft: "bg-yellow-200/20",
    strong: "bg-yellow-200",
    line: "bg-yellow-300",
  },
};

type PresentationSlideProps = {
  slide: SlideDefinition;
  isActive: boolean;
};

export function PresentationSlide({ slide, isActive }: PresentationSlideProps) {
  const accent = ACCENT_STYLES[slide.accent];

  return (
    <article
      className={cn(
        "relative w-full overflow-hidden rounded-[1.75rem] border-2 border-black/90 bg-white/96 p-5 shadow-neo-md transition-[box-shadow,border-color,transform] duration-300 md:h-full md:p-6",
        isActive ? "shadow-neo-lg" : "shadow-neo-md",
      )}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-1.5 border-b-2 border-black/80", accent.strong)} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.65),transparent_36%)]" />

      <div className="relative flex h-full flex-col gap-4">
        {slide.layout === "hero" ? <HeroSlide slide={slide} accent={accent} /> : null}
        {slide.layout === "split-visual" ? <SplitVisualSlide slide={slide} accent={accent} /> : null}
        {slide.layout === "comparison-matrix" ? (
          <ComparisonMatrixSlide slide={slide} accent={accent} />
        ) : null}
        {slide.layout === "process-flow" ? <ProcessFlowSlide slide={slide} accent={accent} /> : null}
        {slide.layout === "roadmap-close" ? <RoadmapCloseSlide slide={slide} accent={accent} /> : null}
      </div>
    </article>
  );
}

function HeroSlide({
  slide,
  accent,
}: {
  slide: SlideDefinition;
  accent: AccentStyle;
}) {
  const isCover = slide.id === "cover";

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Badge className={accent.badge}>
            <Sparkles className="h-3.5 w-3.5" />
            {slide.kicker}
          </Badge>
          {isCover ? <BrandLogo size="lg" showBadge /> : null}
        </div>
      </div>

      <div className="grid flex-1 items-center gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-foreground/55">{slide.sectionLabel}</p>
            <h1 className="max-w-3xl text-balance text-4xl font-black leading-[0.94] text-foreground md:text-[5rem] lg:text-[5.6rem]">
              {slide.title}
            </h1>
            <p className="max-w-2xl text-lg font-semibold leading-relaxed text-foreground/76 md:text-[1.5rem]">
              {slide.thesis}
            </p>
          </div>

          {slide.statements?.length ? <StatementRow statements={slide.statements} accent={accent} /> : null}
          {slide.bullets?.length ? <BulletList bullets={slide.bullets} accent={accent} /> : null}
          {slide.emphasis ? <EmphasisCard text={slide.emphasis} accent={accent} /> : null}
        </div>

        {slide.visual ? (
          <PresentationVisual
            visual={slide.visual}
            accent={accent}
            priority={slide.id === "cover" || slide.id === "conclusion"}
          />
        ) : null}
      </div>

      {slide.stats?.length ? <StatGrid stats={slide.stats} accent={accent} /> : null}
    </div>
  );
}

function SplitVisualSlide({
  slide,
  accent,
}: {
  slide: SlideDefinition;
  accent: AccentStyle;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <SlideLead slide={slide} accent={accent} />

      <div className="grid flex-1 gap-4 lg:grid-cols-[0.76fr_1.24fr]">
        <div className="space-y-4">
          {slide.bullets?.length ? <BulletList bullets={slide.bullets} accent={accent} /> : null}
          {slide.stats?.length ? <StatGrid stats={slide.stats} accent={accent} compact /> : null}
          {slide.emphasis ? <EmphasisCard text={slide.emphasis} accent={accent} /> : null}
        </div>

        <div className="space-y-4">
          {slide.diagram ? <PresentationDiagram diagram={slide.diagram} accent={accent} /> : null}

          {slide.visual ? <PresentationVisual visual={slide.visual} accent={accent} /> : null}

          {slide.visuals?.length ? (
            <div className={cn("grid gap-4", slide.visuals.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
              {slide.visuals.map((visual) => (
                <PresentationVisual key={visual.assetPath ?? visual.alt} visual={visual} accent={accent} />
              ))}
            </div>
          ) : null}

          {slide.cards?.length ? <CardGrid cards={slide.cards} accent={accent} /> : null}
        </div>
      </div>
    </div>
  );
}

function ComparisonMatrixSlide({
  slide,
  accent,
}: {
  slide: SlideDefinition;
  accent: AccentStyle;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <SlideLead slide={slide} accent={accent} />

      {slide.bullets?.length ? <BulletList bullets={slide.bullets} accent={accent} compact /> : null}

      {slide.matrix?.length ? <MatrixGrid items={slide.matrix} accent={accent} /> : null}
      {slide.cards?.length ? <CardGrid cards={slide.cards} accent={accent} /> : null}

      {slide.emphasis ? <EmphasisCard text={slide.emphasis} accent={accent} /> : null}
    </div>
  );
}

function ProcessFlowSlide({
  slide,
  accent,
}: {
  slide: SlideDefinition;
  accent: AccentStyle;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <SlideLead slide={slide} accent={accent} />

      <div className="grid flex-1 gap-4 lg:grid-cols-[1.06fr_0.94fr]">
        <div className="space-y-4">
          {slide.visual ? <PresentationVisual visual={slide.visual} accent={accent} priority /> : null}
          {slide.emphasis ? <EmphasisCard text={slide.emphasis} accent={accent} /> : null}
        </div>

        <div className="space-y-4">
          {slide.bullets?.length ? <BulletList bullets={slide.bullets} accent={accent} compact /> : null}
          {slide.steps?.length ? <StepGrid steps={slide.steps} accent={accent} /> : null}
        </div>
      </div>

      {slide.stats?.length ? <StatGrid stats={slide.stats} accent={accent} /> : null}
    </div>
  );
}

function RoadmapCloseSlide({
  slide,
  accent,
}: {
  slide: SlideDefinition;
  accent: AccentStyle;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <SlideLead slide={slide} accent={accent} />

      <div className="grid flex-1 gap-4 lg:grid-cols-[1.04fr_0.96fr]">
        {slide.visual ? <PresentationVisual visual={slide.visual} accent={accent} /> : null}

        <div className="space-y-4">
          {slide.bullets?.length ? <BulletList bullets={slide.bullets} accent={accent} compact /> : null}
          {slide.roadmap?.length ? <RoadmapList roadmap={slide.roadmap} accent={accent} /> : null}
          {slide.emphasis ? <EmphasisCard text={slide.emphasis} accent={accent} /> : null}
        </div>
      </div>
    </div>
  );
}

function SlideLead({
  slide,
  accent,
}: {
  slide: SlideDefinition;
  accent: AccentStyle;
}) {
  return (
    <div className="space-y-2.5">
      <div className="space-y-2.5">
        <div className="space-y-3">
          <Badge className={accent.badge}>
            <Sparkles className="h-3.5 w-3.5" />
            {slide.sectionLabel}
          </Badge>
          <div className="space-y-1.5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/55">{slide.kicker}</p>
            <h2 className="max-w-4xl text-balance text-3xl font-black leading-tight text-foreground md:text-[3.4rem] lg:text-[3.75rem]">
              {slide.title}
            </h2>
            <p className="max-w-3xl text-base font-medium leading-relaxed text-foreground/76 md:text-[1.22rem]">
              {slide.thesis}
            </p>
          </div>
        </div>
      </div>

      {slide.statements?.length ? <StatementRow statements={slide.statements} accent={accent} /> : null}
    </div>
  );
}

function StatementRow({
  statements,
  accent,
}: {
  statements: string[];
  accent: AccentStyle;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {statements.map((statement) => (
        <span
          key={statement}
          className={cn(
            "rounded-full border-2 border-black px-4 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-neo-sm",
            accent.chip,
          )}
        >
          {statement}
        </span>
      ))}
    </div>
  );
}

function BulletList({
  bullets,
  accent,
  compact = false,
}: {
  bullets: string[];
  accent: AccentStyle;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-[1.5rem] border-2 border-black shadow-neo-sm", compact ? accent.soft : accent.panel)}>
      <div className="space-y-3 p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">Điểm chính</p>
        <div className="space-y-3">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold leading-relaxed text-foreground/82 md:text-[1.12rem]">{bullet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmphasisCard({
  text,
  accent,
}: {
  text: string;
  accent: AccentStyle;
}) {
  return (
    <div className={cn("rounded-[1.5rem] border-2 border-black p-4 shadow-neo-sm md:p-5", accent.soft)}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">Takeaway</p>
      <p className="mt-3 text-base font-black leading-relaxed text-foreground/86 md:text-[1.2rem]">{text}</p>
    </div>
  );
}

function StatGrid({
  stats,
  accent,
  compact = false,
}: {
  stats: SlideStat[];
  accent: AccentStyle;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-4", compact ? "md:grid-cols-1 lg:grid-cols-3" : "md:grid-cols-3")}>
      {stats.map((stat) => (
        <div
          key={`${stat.label}-${stat.value}`}
          className={cn("rounded-[1.35rem] border-2 border-black p-4 shadow-neo-sm md:p-5", compact ? accent.soft : accent.panel)}
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">{stat.label}</p>
          <p className="mt-3 text-2xl font-black leading-none md:text-[2.35rem]">{stat.value}</p>
          {stat.note ? <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground/76 md:text-[1rem]">{stat.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

function CardGrid({
  cards,
  accent,
}: {
  cards: SlideCard[];
  accent: AccentStyle;
}) {
  const cardIcons = [Target, BrainCircuit, Users, Wallet];
  const columnsClass = cards.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-4", columnsClass)}>
      {cards.map((card, index) => {
        const Icon = cardIcons[index % cardIcons.length];

        return (
          <div key={`${card.label ?? ""}-${card.title}`} className={cn("rounded-[1.5rem] border-2 border-black p-4 shadow-neo-sm md:p-5", accent.soft)}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                {card.label ? (
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">{card.label}</p>
                ) : null}
                <p className="text-lg font-black leading-snug md:text-[1.35rem]">{card.title}</p>
              </div>
              <span className={cn("inline-flex rounded-xl border-2 border-black p-2 shadow-neo-sm", accent.chip)}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground/80 md:text-[1rem]">{card.body}</p>
          </div>
        );
      })}
    </div>
  );
}

function MatrixGrid({
  items,
  accent,
}: {
  items: SlideMatrixItem[];
  accent: AccentStyle;
}) {
  if (items.length === 3) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <MatrixCard
            key={`${item.label ?? ""}-${item.title}`}
            item={item}
            accent={accent}
            className={index === 2 ? "md:col-span-2" : undefined}
            highlight={index === 2}
          />
        ))}
      </div>
    );
  }

  const columnsClass = items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid gap-4", columnsClass)}>
      {items.map((item) => (
        <MatrixCard key={`${item.label ?? ""}-${item.title}`} item={item} accent={accent} />
      ))}
    </div>
  );
}

function MatrixCard({
  item,
  accent,
  className,
  highlight = false,
}: {
  item: SlideMatrixItem;
  accent: AccentStyle;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border-2 border-black p-4 shadow-neo-sm md:p-5",
        highlight ? accent.panel : accent.soft,
        className,
      )}
    >
      {item.label ? <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">{item.label}</p> : null}
      <p className="mt-2 text-lg font-black leading-snug md:text-[1.3rem]">{item.title}</p>

      <div className={cn("mt-4 gap-3", highlight ? "grid md:grid-cols-3" : "space-y-3")}>
        {item.items.map((point) => (
          <div key={point} className="flex gap-3">
            <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-black", accent.line)} />
            <p className="text-sm font-semibold leading-relaxed text-foreground/80 md:text-[1rem]">{point}</p>
          </div>
        ))}
      </div>

      {item.emphasis ? (
        <div
          className={cn(
            "mt-5 inline-flex rounded-xl border-2 border-black px-3 py-2 text-xs font-black uppercase tracking-[0.08em] shadow-neo-sm",
            accent.chip,
          )}
        >
          {item.emphasis}
        </div>
      ) : null}
    </div>
  );
}

function StepGrid({
  steps,
  accent,
}: {
  steps: SlideStep[];
  accent: AccentStyle;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {steps.map((step, index) => (
        <div key={step.title} className={cn("rounded-[1.5rem] border-2 border-black p-4 shadow-neo-sm md:p-5", accent.soft)}>
          <div className="flex items-center justify-between gap-4">
            <span className={cn("rounded-full border-2 border-black px-3 py-1 text-xs font-black shadow-neo-sm", accent.chip)}>
              0{index + 1}
            </span>
            {index < steps.length - 1 ? <ArrowRight className="h-4 w-4" /> : <Workflow className="h-4 w-4" />}
          </div>
          <p className="mt-5 text-lg font-black leading-snug md:text-[1.28rem]">{step.title}</p>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground/80 md:text-[1rem]">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

function RoadmapList({
  roadmap,
  accent,
}: {
  roadmap: SlideRoadmapPhase[];
  accent: AccentStyle;
}) {
  return (
    <div className="space-y-4">
      {roadmap.map((phase, index) => (
        <div key={phase.phase} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-black text-xs font-black shadow-neo-sm", accent.chip)}>
              {phase.phase}
            </span>
            {index < roadmap.length - 1 ? <span className={cn("mt-2 h-full w-0.5 min-h-10", accent.line)} /> : null}
          </div>
          <div className={cn("flex-1 rounded-[1.35rem] border-2 border-black p-4 shadow-neo-sm md:p-5", accent.soft)}>
            <p className="text-lg font-black leading-snug md:text-[1.28rem]">{phase.title}</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/80 md:text-[1rem]">{phase.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PresentationDiagram({
  diagram,
  accent,
}: {
  diagram: SlideDiagram;
  accent: AccentStyle;
}) {
  if (diagram === "dual-meaning") {
    return <DualMeaningDiagram accent={accent} />;
  }

  if (diagram === "human-loop") {
    return <HumanLoopDiagram accent={accent} />;
  }

  return <MarketplaceDiagram accent={accent} />;
}

function DualMeaningDiagram({ accent }: { accent: AccentStyle }) {
  return (
    <div className={cn("rounded-[1.75rem] border-2 border-black p-4 shadow-neo-md md:p-5", accent.panel)}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">Mini diagram</p>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <DiagramCard
          icon={GraduationCap}
          title="Nhỏ tí"
          body="Sinh viên bắt đầu từ việc nhỏ để tích lũy kỹ năng và sự tự tin."
          accent={accent}
        />
        <div className="flex justify-center">
          <div className={cn("inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-black text-center text-sm font-black shadow-neo-sm", accent.chip)}>
            Nho Ti
          </div>
        </div>
        <DiagramCard
          icon={Building2}
          title="Nhờ tí"
          body="SME có những đầu việc nhỏ nhưng cần đúng người xử lý nhanh."
          accent={accent}
        />
      </div>
      <div className={cn("mt-4 rounded-2xl border-2 border-black px-4 py-3 text-sm font-bold shadow-neo-sm md:text-[1rem]", accent.soft)}>
        AI đứng giữa để làm rõ nhu cầu, ghép đúng người và giảm ma sát triển khai.
      </div>
    </div>
  );
}

function HumanLoopDiagram({ accent }: { accent: AccentStyle }) {
  return (
    <div className={cn("rounded-[1.75rem] border-2 border-black p-4 shadow-neo-md md:p-5", accent.panel)}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">Human in the loop</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <DiagramCard
          icon={Building2}
          title="SME"
          body="Nêu nhu cầu và phản hồi theo bối cảnh thực tế."
          accent={accent}
        />
        <DiagramCard
          icon={BrainCircuit}
          title="AI hỗ trợ"
          body="Chuẩn hóa brief, matching và nhắc nhịp phối hợp."
          accent={accent}
        />
        <DiagramCard
          icon={GraduationCap}
          title="Sinh viên"
          body="Dùng AI như công cụ để tạo đầu ra thật và chịu trách nhiệm thật."
          accent={accent}
        />
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm font-bold text-foreground/80 md:text-[1rem]">
        <ArrowRight className="h-4 w-4" />
        Đầu ra cuối cùng vẫn cần con người hiểu bối cảnh, điều chỉnh và kiểm tra chất lượng.
      </div>
    </div>
  );
}

function MarketplaceDiagram({ accent }: { accent: AccentStyle }) {
  return (
    <div className={cn("rounded-[1.75rem] border-2 border-black p-4 shadow-neo-md md:p-5", accent.panel)}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/55">Marketplace diagram</p>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <DiagramCard
          icon={Building2}
          title="SME"
          body="Có việc thật, cần đầu ra thật và là phía trả phí đầu tiên."
          accent={accent}
        />
        <div className="flex justify-center">
          <div className={cn("inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-black text-center text-sm font-black shadow-neo-sm", accent.chip)}>
            Nho Ti
          </div>
        </div>
        <DiagramCard
          icon={GraduationCap}
          title="Sinh viên"
          body="Có năng lực đang lớn lên và cần cơ hội thực chiến thật."
          accent={accent}
        />
      </div>
      <div className={cn("mt-4 inline-flex rounded-full border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] shadow-neo-sm", accent.chip)}>
        <Wallet className="mr-2 h-4 w-4" />
        Bên trả phí đầu tiên: SME
      </div>
    </div>
  );
}

function DiagramCard({
  icon: Icon,
  title,
  body,
  accent,
}: {
  icon: typeof GraduationCap;
  title: string;
  body: string;
  accent: AccentStyle;
}) {
  return (
    <div className={cn("rounded-[1.35rem] border-2 border-black p-4 shadow-neo-sm", accent.soft)}>
      <span className={cn("inline-flex rounded-xl border-2 border-black p-2 shadow-neo-sm", accent.chip)}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-lg font-black leading-snug md:text-[1.28rem]">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/80 md:text-[1rem]">{body}</p>
    </div>
  );
}
