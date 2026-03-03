import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, ShieldX } from "lucide-react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const { identity, login, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetching: adminFetching,
  } = useIsAdmin();
  const isLoggedIn = !!identity;

  // Show loader while:
  // 1. Identity store is hydrating
  // 2. Actor is setting up
  // 3. User is logged in but the admin check hasn't resolved yet
  const isChecking =
    isInitializing ||
    actorFetching ||
    (isLoggedIn && (adminLoading || adminFetching));

  // Step 1: Still checking — show loader. Never redirect prematurely.
  if (isChecking) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // Step 2: Not logged in — prompt login
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="card-gaming rounded-2xl p-10 text-center max-w-md">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-black mb-2 gradient-text-gaming">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please login to access the admin panel.
          </p>
          <Button
            data-ocid="admin.primary_button"
            onClick={login}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Logged in, admin check resolved as true — grant access
  if (isAdmin === true) {
    return <>{children}</>;
  }

  // Step 4: Logged in, admin check resolved as false — deny access and redirect
  // (isAdmin is false here; undefined would have been caught by isChecking above)
  void navigate({ to: "/" });
  return (
    <div
      data-ocid="admin.error_state"
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <div className="card-gaming rounded-2xl p-10 text-center max-w-md">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-black mb-2 text-destructive">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm">
          You don&apos;t have admin privileges.
        </p>
      </div>
    </div>
  );
}
