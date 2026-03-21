import { SignOutButton } from "@/components/layout/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  name: string;
  role: "SME" | "STUDENT";
  onToggleNavigation: () => void;
};

export function Header({ name, role, onToggleNavigation }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="page-wrap flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button className="lg:hidden" onClick={onToggleNavigation} size="sm" variant="secondary">
            Menu
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Xin chào</p>
            <p className="text-sm font-semibold text-foreground md:text-base">{name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={role === "SME" ? "default" : "secondary"}>{role === "SME" ? "Doanh nghiệp" : "Sinh viên"}</Badge>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
