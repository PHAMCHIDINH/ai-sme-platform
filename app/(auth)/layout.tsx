export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(21,99,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(15,79,208,0.12),_transparent_55%)]">
      {children}
    </div>
  );
}
