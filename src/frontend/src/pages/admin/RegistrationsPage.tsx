import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Filter,
  Loader2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Registration } from "../../backend.d";
import { useBlobStorage } from "../../hooks/useBlobStorage";
import {
  useAllRegistrations,
  useAllTournaments,
  useApproveRegistration,
  useDisapproveRegistration,
} from "../../hooks/useQueries";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs font-semibold capitalize">
        ✓ Approved
      </Badge>
    );
  }
  if (status === "disapproved" || status === "rejected") {
    return (
      <Badge className="bg-destructive/10 text-destructive border border-destructive/30 text-xs font-semibold capitalize">
        ✗ Disapproved
      </Badge>
    );
  }
  return (
    <Badge className="bg-accent/10 text-accent border border-accent/30 text-xs font-semibold capitalize">
      ⏳ Pending
    </Badge>
  );
}

function ReceiptThumbnail({ blobId }: { blobId: string }) {
  const { getBlobUrl } = useBlobStorage();
  const [url, setUrl] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!blobId) return;
    getBlobUrl(blobId)
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [blobId, getBlobUrl]);

  if (!url) {
    return (
      <span className="text-xs text-muted-foreground italic">
        {blobId ? "Loading..." : "No receipt"}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors group"
      >
        <img
          src={url}
          alt="Receipt"
          className="h-10 w-10 object-cover rounded-md border border-border group-hover:border-primary/40 transition-colors"
        />
        <ExternalLink className="h-3 w-3" />
      </button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="receipt.dialog"
          className="max-w-2xl bg-gaming-surface-2 border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Payment Receipt
            </DialogTitle>
          </DialogHeader>
          <img
            src={url}
            alt="Full receipt"
            className="w-full max-h-[70vh] object-contain rounded-lg border border-border"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface RegistrationRowProps {
  registration: Registration;
  index: number;
  tournamentName: string;
}

function RegistrationRow({
  registration,
  index,
  tournamentName,
}: RegistrationRowProps) {
  const approveReg = useApproveRegistration();
  const disapproveReg = useDisapproveRegistration();
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);

  const status = optimisticStatus ?? registration.status;
  const isPending = status === "pending";

  const handleApprove = useCallback(async () => {
    setOptimisticStatus("approved");
    try {
      await approveReg.mutateAsync(registration.id);
      toast.success(`Approved ${registration.playerName}`);
    } catch (err) {
      setOptimisticStatus(null);
      const message = err instanceof Error ? err.message : "Failed to approve";
      toast.error(message);
    }
  }, [approveReg, registration.id, registration.playerName]);

  const handleDisapprove = useCallback(async () => {
    setOptimisticStatus("disapproved");
    try {
      await disapproveReg.mutateAsync(registration.id);
      toast.success(`Disapproved ${registration.playerName}`);
    } catch (err) {
      setOptimisticStatus(null);
      const message =
        err instanceof Error ? err.message : "Failed to disapprove";
      toast.error(message);
    }
  }, [disapproveReg, registration.id, registration.playerName]);

  const isProcessing = approveReg.isPending || disapproveReg.isPending;

  return (
    <motion.tr
      data-ocid={`registrations.row.${index + 1}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-border hover:bg-gaming-surface-2/50 transition-colors"
    >
      <td className="py-3 px-4">
        <div>
          <p className="font-semibold text-sm text-foreground">
            {registration.playerName}
          </p>
          <p className="text-xs text-muted-foreground">
            {registration.contactNumber}
          </p>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-mono text-xs text-muted-foreground bg-gaming-surface-2 px-2 py-1 rounded">
          {registration.playerUid}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-foreground">{tournamentName}</span>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={status} />
      </td>
      <td className="py-3 px-4">
        <ReceiptThumbnail blobId={registration.paymentReceiptBlobId} />
      </td>
      <td className="py-3 px-4">
        {isPending ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              data-ocid={`registrations.approve.button.${index + 1}`}
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all h-8 px-3 text-xs font-semibold"
            >
              {approveReg.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              data-ocid={`registrations.disapprove.button.${index + 1}`}
              onClick={handleDisapprove}
              disabled={isProcessing}
              className="bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-all h-8 px-3 text-xs font-semibold"
            >
              {disapproveReg.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )}
              Disapprove
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic capitalize">
            {status}
          </span>
        )}
      </td>
    </motion.tr>
  );
}

export function RegistrationsPage() {
  const [filterTournamentId, setFilterTournamentId] = useState<bigint | null>(
    null,
  );

  const { data: registrations, isLoading: regLoading } =
    useAllRegistrations(filterTournamentId);
  const { data: tournaments, isLoading: tournamentsLoading } =
    useAllTournaments();

  const isLoading = regLoading || tournamentsLoading;

  const getTournamentName = (tournamentId: bigint): string => {
    const tournament = tournaments?.find((t) => t.id === tournamentId);
    return tournament
      ? tournament.gameName
      : `Tournament #${tournamentId.toString()}`;
  };

  const handleFilterChange = (value: string) => {
    if (value === "all") {
      setFilterTournamentId(null);
    } else {
      setFilterTournamentId(BigInt(value));
    }
  };

  const pendingCount =
    registrations?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <div data-ocid="registrations.table">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            All Registrations
          </h2>
          {pendingCount > 0 && (
            <span className="bg-accent/10 text-accent border border-accent/30 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filterTournamentId ? filterTournamentId.toString() : "all"}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger
              data-ocid="registrations.filter.select"
              className="w-48 bg-gaming-surface-2 border-border text-sm"
            >
              <SelectValue placeholder="All Tournaments" />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent className="bg-gaming-surface-2 border-border">
              <SelectItem value="all">All Tournaments</SelectItem>
              {tournaments?.map((t) => (
                <SelectItem key={t.id.toString()} value={t.id.toString()}>
                  {t.gameName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="card-gaming rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((skId) => (
              <Skeleton
                key={skId}
                className="h-14 w-full rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : !registrations || registrations.length === 0 ? (
          <div
            data-ocid="registrations.empty_state"
            className="p-16 text-center"
          >
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center">
              <ClipboardList className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">
              No registrations yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Registrations will appear here once players sign up
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gaming-surface-1/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Player
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    In-Game UID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Tournament
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Receipt
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, idx) => (
                  <RegistrationRow
                    key={reg.id.toString()}
                    registration={reg}
                    index={idx}
                    tournamentName={getTournamentName(reg.tournamentId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
