import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, TrendingUp, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { useAllRegistrations, useAllTournaments } from "../../hooks/useQueries";

export function DashboardPage() {
  const { data: tournaments, isLoading: tournamentsLoading } =
    useAllTournaments();
  const { data: registrations, isLoading: registrationsLoading } =
    useAllRegistrations();

  const isLoading = tournamentsLoading || registrationsLoading;

  const stats = {
    totalTournaments: tournaments?.length ?? 0,
    activeTournaments:
      tournaments?.filter((t) => t.status === "active").length ?? 0,
    totalRegistrations: registrations?.length ?? 0,
    pendingRegistrations:
      registrations?.filter((r) => r.status === "pending").length ?? 0,
    approvedRegistrations:
      registrations?.filter((r) => r.status === "approved").length ?? 0,
  };

  const statCards = [
    {
      label: "Total Tournaments",
      value: stats.totalTournaments,
      icon: Trophy,
      color: "text-gaming-gold",
      bgColor: "bg-gaming-gold/10 border-gaming-gold/20",
    },
    {
      label: "Active Tournaments",
      value: stats.activeTournaments,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      label: "Total Registrations",
      value: stats.totalRegistrations,
      icon: Users,
      color: "text-gaming-pubg-blue",
      bgColor: "bg-gaming-pubg-blue/10 border-gaming-pubg-blue/20",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingRegistrations,
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10 border-accent/20",
    },
    {
      label: "Approved",
      value: stats.approvedRegistrations,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Overview
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className={`card-gaming rounded-xl p-5 border ${card.bgColor}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`h-10 w-10 rounded-lg bg-current/10 flex items-center justify-center ${card.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mb-2 bg-muted" />
              ) : (
                <p className={`font-display text-3xl font-black ${card.color}`}>
                  {card.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Tournaments */}
      {tournaments && tournaments.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">
            Recent Tournaments
          </h3>
          <div className="space-y-3">
            {tournaments.slice(0, 5).map((t) => (
              <div
                key={t.id.toString()}
                className="card-gaming rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {t.gameName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Number(t.joinedSlots)}/{Number(t.totalSlots)} slots ·{" "}
                    {t.entryFee} entry · {t.prizePool} prize
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
                    t.status === "active"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
