import { BRAND_DISPLAY_NAME, BRAND_NAME, BRAND_TAGLINE } from "@/lib/branding";
import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md" | "lg";

type BrandLogoProps = {
  className?: string;
  size?: BrandLogoSize;
  showTagline?: boolean;
  showBadge?: boolean;
};

const SIZE_STYLES: Record<
  BrandLogoSize,
  {
    gap: string;
    mark: string;
    wordmark: string;
    label: string;
    badge: string;
    tagline: string;
  }
> = {
  sm: {
    gap: "gap-2.5",
    mark: "h-10 w-10",
    wordmark: "text-xl",
    label: "text-[10px]",
    badge: "px-2 py-0.5 text-[9px]",
    tagline: "text-[11px]",
  },
  md: {
    gap: "gap-3",
    mark: "h-12 w-12",
    wordmark: "text-[1.65rem]",
    label: "text-[10px]",
    badge: "px-2.5 py-0.5 text-[10px]",
    tagline: "text-xs",
  },
  lg: {
    gap: "gap-4",
    mark: "h-14 w-14",
    wordmark: "text-[2rem]",
    label: "text-[11px]",
    badge: "px-3 py-1 text-[10px]",
    tagline: "text-sm",
  },
};

export function BrandLogo({
  className,
  size = "md",
  showTagline = false,
  showBadge = false,
}: BrandLogoProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div className={cn("inline-flex items-center", styles.gap, className)}>
      <BrandMark className={styles.mark} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "font-black uppercase tracking-[0.18em] text-foreground/55",
                styles.label,
              )}
            >
              {BRAND_DISPLAY_NAME}
            </p>
            <p
              className={cn(
                "font-black lowercase leading-none tracking-[-0.08em] text-foreground",
                styles.wordmark,
              )}
            >
              {BRAND_NAME.slice(0, 3)}
              <span className="text-[#6d28d9]">{BRAND_NAME.slice(3)}</span>
            </p>
          </div>

          {showBadge ? (
            <span
              className={cn(
                "rounded-full border-2 border-black bg-lime-200 font-black uppercase tracking-[0.08em] text-foreground shadow-neo-sm",
                styles.badge,
              )}
            >
              Nhỏ tí, giá trị thật
            </span>
          ) : null}
        </div>

        {showTagline ? (
          <p className={cn("mt-1 max-w-sm font-semibold text-foreground/75", styles.tagline)}>
            {BRAND_TAGLINE}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        x="10"
        y="18"
        width="42"
        height="42"
        rx="14"
        fill="#7de4ff"
        stroke="#111111"
        strokeWidth="4"
      />
      <rect
        x="20"
        y="8"
        width="42"
        height="42"
        rx="14"
        fill="#ffe500"
        stroke="#111111"
        strokeWidth="4"
      />
      <path
        d="M28 45V27.5C28 23.3579 31.3579 20 35.5 20C39.6421 20 43 23.3579 43 27.5V45"
        stroke="#111111"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M48 26H58"
        stroke="#6d28d9"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M53 26V46"
        stroke="#6d28d9"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle
        cx="53"
        cy="15"
        r="4.5"
        fill="#fb7185"
        stroke="#111111"
        strokeWidth="3"
      />
      <path
        d="M15 58C20 54 28 52 35.5 53"
        stroke="#111111"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.2"
      />
    </svg>
  );
}
