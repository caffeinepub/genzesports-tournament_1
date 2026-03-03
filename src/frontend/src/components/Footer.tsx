import { Gamepad2 } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="border-t border-border bg-gaming-surface-1/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="font-display font-bold gradient-text-gaming">
              GenZesports Tournament
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear}. Built with{" "}
            <span className="text-destructive">♥</span> using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono text-primary/60">
              Free Fire • PUBG Mobile
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
