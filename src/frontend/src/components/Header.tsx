import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Gamepad2, LogIn, LogOut, Menu, Shield, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export function Header() {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: isAdmin } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-gaming-surface-1/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="nav.home.link"
        >
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Gamepad2 className="h-5 w-5 text-primary" />
          </motion.div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold gradient-text-gaming leading-none">
              GenZesports
            </span>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase leading-none">
              Tournament
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.tournaments.link"
          >
            Tournaments
          </Link>
          {isLoggedIn && isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              data-ocid="nav.admin.link"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Auth Button */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="border-border text-muted-foreground hover:text-foreground hover:border-destructive/50 hover:text-destructive transition-all"
              data-ocid="nav.logout.button"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="nav.login.button"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border bg-gaming-surface-1 px-4 py-4 space-y-3"
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground"
            data-ocid="nav.mobile.tournaments.link"
          >
            Tournaments
          </Link>
          {isLoggedIn && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary"
              data-ocid="nav.mobile.admin.link"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <div className="pt-2 border-t border-border">
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clear();
                  setMobileMenuOpen(false);
                }}
                className="w-full border-border text-muted-foreground"
                data-ocid="nav.mobile.logout.button"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  login();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingIn || isInitializing}
                className="w-full bg-primary text-primary-foreground font-semibold"
                data-ocid="nav.mobile.login.button"
              >
                <LogIn className="h-4 w-4 mr-1.5" />
                {isLoggingIn ? "Connecting..." : "Login"}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
