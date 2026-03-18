import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(21,99,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(15,79,208,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(84,143,255,0.2),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(29,78,216,0.24),_transparent_55%)]">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
