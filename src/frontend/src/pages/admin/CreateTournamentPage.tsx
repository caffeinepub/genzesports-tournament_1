import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Gamepad2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateTournament } from "../../hooks/useQueries";

const GAME_OPTIONS = ["Free Fire", "PUBG Mobile"];

export function CreateTournamentPage() {
  const navigate = useNavigate();
  const createTournament = useCreateTournament();

  const [gameName, setGameName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!gameName) newErrors.gameName = "Game name is required";
    if (!dateTime) newErrors.dateTime = "Date & time is required";
    if (!totalSlots || Number(totalSlots) < 2)
      newErrors.totalSlots = "Minimum 2 slots required";
    if (!entryFee.trim()) newErrors.entryFee = "Entry fee is required";
    if (!prizePool.trim()) newErrors.prizePool = "Prize pool is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createTournament.mutateAsync({
        gameName,
        dateTime,
        totalSlots: BigInt(totalSlots),
        entryFee: entryFee.trim(),
        prizePool: prizePool.trim(),
      });
      setCreated(true);
      toast.success("Tournament created successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create tournament";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl">
      <AnimatePresence mode="wait">
        {created ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-gaming rounded-2xl p-12 text-center"
            data-ocid="tournament_form.success_state"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center glow-green"
            >
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </motion.div>
            <h2 className="font-display text-3xl font-black mb-3 gradient-text-gaming">
              Tournament Created!
            </h2>
            <p className="text-muted-foreground mb-6">
              The tournament is now live and players can register.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setCreated(false);
                  setGameName("");
                  setDateTime("");
                  setTotalSlots("");
                  setEntryFee("");
                  setPrizePool("");
                }}
                variant="outline"
                className="border-border"
              >
                Create Another
              </Button>
              <Button
                onClick={() => navigate({ to: "/admin" })}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-gaming rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    New Tournament
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Fill in the tournament details below
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Game Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Game Name <span className="text-destructive">*</span>
                  </Label>
                  <Select value={gameName} onValueChange={setGameName}>
                    <SelectTrigger
                      data-ocid="tournament_form.game_name.select"
                      className="bg-gaming-surface-2 border-border focus:border-primary/50"
                    >
                      <SelectValue placeholder="Select a game..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-surface-2 border-border">
                      {GAME_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gameName && (
                    <p className="text-xs text-destructive">
                      {errors.gameName}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                  <Label htmlFor="dateTime" className="text-sm font-medium">
                    Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dateTime"
                    data-ocid="tournament_form.datetime.input"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="bg-gaming-surface-2 border-border focus:border-primary/50"
                    disabled={createTournament.isPending}
                  />
                  {errors.dateTime && (
                    <p className="text-xs text-destructive">
                      {errors.dateTime}
                    </p>
                  )}
                </div>

                {/* Total Slots */}
                <div className="space-y-2">
                  <Label htmlFor="totalSlots" className="text-sm font-medium">
                    Total Slots <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="totalSlots"
                    data-ocid="tournament_form.slots.input"
                    type="number"
                    min="2"
                    max="10000"
                    placeholder="e.g. 100"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    className="bg-gaming-surface-2 border-border focus:border-primary/50"
                    disabled={createTournament.isPending}
                  />
                  {errors.totalSlots && (
                    <p className="text-xs text-destructive">
                      {errors.totalSlots}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Entry Fee */}
                  <div className="space-y-2">
                    <Label htmlFor="entryFee" className="text-sm font-medium">
                      Entry Fee <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="entryFee"
                      data-ocid="tournament_form.entry_fee.input"
                      placeholder="e.g. ₹50"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      className="bg-gaming-surface-2 border-border focus:border-primary/50"
                      disabled={createTournament.isPending}
                    />
                    {errors.entryFee && (
                      <p className="text-xs text-destructive">
                        {errors.entryFee}
                      </p>
                    )}
                  </div>

                  {/* Prize Pool */}
                  <div className="space-y-2">
                    <Label htmlFor="prizePool" className="text-sm font-medium">
                      Prize Pool <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="prizePool"
                      data-ocid="tournament_form.prize_pool.input"
                      placeholder="e.g. ₹500"
                      value={prizePool}
                      onChange={(e) => setPrizePool(e.target.value)}
                      className="bg-gaming-surface-2 border-border focus:border-primary/50"
                      disabled={createTournament.isPending}
                    />
                    {errors.prizePool && (
                      <p className="text-xs text-destructive">
                        {errors.prizePool}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  data-ocid="tournament_form.submit_button"
                  disabled={createTournament.isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 glow-green"
                >
                  {createTournament.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Tournament...
                    </>
                  ) : (
                    "Create Tournament"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
