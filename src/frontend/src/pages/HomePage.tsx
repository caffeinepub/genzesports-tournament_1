import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Swords, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { TournamentCard } from "../components/TournamentCard";
import { useActiveTournaments } from "../hooks/useQueries";

export function HomePage() {
  const {
    data: tournaments,
    isLoading,
    isError,
    refetch,
  } = useActiveTournaments(10_000);

  return (
    <main data-ocid="home.page" className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6 font-mono tracking-widest">
            <Wifi className="h-3 w-3 animate-pulse-glow" />
            LIVE TOURNAMENTS
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="gradient-text-gaming">Compete.</span>{" "}
            <span className="text-foreground">Win.</span>{" "}
            <span className="gradient-text-gaming">Dominate.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join the ultimate Free Fire and PUBG Mobile tournament platform.
            Register, compete, and claim your glory.
          </p>
        </motion.div>
      </section>

      {/* Tournament List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            Active Tournaments
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            data-ocid="home.tournament.loading_state"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {["sk-1", "sk-2", "sk-3"].map((skId) => (
              <div key={skId} className="card-gaming rounded-xl p-5 space-y-4">
                <Skeleton className="h-7 w-32 rounded-full bg-muted" />
                <Skeleton className="h-6 w-48 bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-muted" />
                <Skeleton className="h-10 w-full rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div
            data-ocid="home.tournament.error_state"
            className="card-gaming rounded-xl p-12 text-center"
          >
            <p className="text-destructive font-semibold mb-2">
              Failed to load tournaments
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Please try again
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* Tournament Grid */}
        {!isLoading && !isError && tournaments && tournaments.length > 0 && (
          <div
            data-ocid="home.tournament_list"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {tournaments.map((tournament, idx) => (
              <TournamentCard
                key={tournament.id.toString()}
                tournament={tournament}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !isError &&
          (!tournaments || tournaments.length === 0) && (
            <div
              data-ocid="home.empty_state"
              className="card-gaming rounded-xl p-16 text-center"
            >
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Swords className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No Active Tournaments
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                No tournaments are currently active. Check back soon for
                upcoming events!
              </p>
            </div>
          )}
      </section>
    </main>
  );
}
