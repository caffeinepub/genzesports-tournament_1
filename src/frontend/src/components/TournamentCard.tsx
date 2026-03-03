import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, Trophy, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { Tournament } from "../backend.d";

interface TournamentCardProps {
  tournament: Tournament;
  index: number;
}

function getGameStyle(gameName: string) {
  const name = gameName.toLowerCase();
  if (name.includes("free fire") || name.includes("freefire")) {
    return {
      badge: "Free Fire",
      bgClass: "bg-gaming-ff-orange/10 border-gaming-ff-orange/30",
      textClass: "text-gaming-ff-orange",
      dotClass: "bg-gaming-ff-orange",
      glowClass: "hover:shadow-[0_0_24px_oklch(0.72_0.21_40_/_0.2)]",
    };
  }
  return {
    badge: "PUBG Mobile",
    bgClass: "bg-gaming-pubg-blue/10 border-gaming-pubg-blue/30",
    textClass: "text-gaming-pubg-blue",
    dotClass: "bg-gaming-pubg-blue",
    glowClass: "hover:shadow-[0_0_24px_oklch(0.65_0.18_240_/_0.2)]",
  };
}

function formatDateTime(dateTime: string) {
  try {
    const date = new Date(dateTime);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateTime;
  }
}

export function TournamentCard({ tournament, index }: TournamentCardProps) {
  const gameStyle = getGameStyle(tournament.gameName);
  const joined = Number(tournament.joinedSlots);
  const total = Number(tournament.totalSlots);
  const progressPercent = total > 0 ? Math.min((joined / total) * 100, 100) : 0;
  const isFull = joined >= total;

  return (
    <motion.article
      data-ocid={`home.tournament.card.${index + 1}`}
      className={`card-gaming rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 cursor-default ${gameStyle.glowClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -3 }}
    >
      {/* Game Badge + Status */}
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${gameStyle.bgClass} ${gameStyle.textClass}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${gameStyle.dotClass} animate-pulse-glow`}
          />
          {gameStyle.badge}
        </span>
        {isFull ? (
          <Badge
            variant="secondary"
            className="text-xs bg-muted/80 text-muted-foreground"
          >
            Full
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs border-primary/30 text-primary bg-primary/5"
          >
            Open
          </Badge>
        )}
      </div>

      {/* Tournament Name */}
      <div>
        <h3 className="font-display text-xl font-bold text-foreground leading-tight">
          {tournament.gameName} Tournament
        </h3>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary/60 shrink-0" />
          <span className="truncate">
            {formatDateTime(tournament.dateTime)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4 text-accent/60 shrink-0" />
          <span>
            Entry:{" "}
            <strong className="text-foreground">{tournament.entryFee}</strong>
          </span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4 text-gaming-gold/80 shrink-0" />
          <span>
            Prize Pool:{" "}
            <strong className="text-gaming-gold text-glow-gold">
              {tournament.prizePool}
            </strong>
          </span>
        </div>
      </div>

      {/* Slots Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Slots Joined
          </span>
          <span className="font-mono font-semibold">
            <span className="text-primary">{joined}</span>
            <span className="text-muted-foreground">/{total}</span>
          </span>
        </div>
        <div className="progress-gaming rounded-full h-2 overflow-hidden">
          <motion.div
            className="progress-gaming-fill h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{
              delay: index * 0.07 + 0.3,
              duration: 0.6,
              ease: "easeOut",
            }}
          />
        </div>
      </div>

      {/* Register Button */}
      <Link
        to="/tournament/$id/register"
        params={{ id: tournament.id.toString() }}
        className="block"
        data-ocid={`home.register.button.${index + 1}`}
      >
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold group"
          disabled={isFull}
          data-ocid={`home.tournament.item.${index + 1}`}
        >
          {isFull ? "Tournament Full" : "Register Now"}
          {!isFull && (
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          )}
        </Button>
      </Link>
    </motion.article>
  );
}
