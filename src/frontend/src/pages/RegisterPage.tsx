import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Loader2,
  Trophy,
  Upload,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { useSubmitRegistration, useTournamentById } from "../hooks/useQueries";

const UPI_ID = "7087568640@fam";
const QR_IMAGE = "/assets/uploads/Screenshot_2026_0302_165433-1.png";

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

export function RegisterPage() {
  const { id } = useParams({ from: "/tournament/$id/register" });
  const navigate = useNavigate();
  const tournamentId = BigInt(id);

  const { data: tournament, isLoading: tournamentLoading } =
    useTournamentById(tournamentId);
  const submitRegistration = useSubmitRegistration();
  const { upload, isUploading, uploadProgress } = useBlobStorage();

  const [playerName, setPlayerName] = useState("");
  const [playerUid, setPlayerUid] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCopyUpi = useCallback(() => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("UPI ID copied!");
    });
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
      setErrors((prev) => ({ ...prev, receipt: "" }));
    },
    [],
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!playerName.trim()) newErrors.playerName = "Player name is required";
    if (!playerUid.trim()) newErrors.playerUid = "In-Game UID is required";
    if (!contactNumber.trim()) newErrors.contact = "Contact number is required";
    if (!receiptFile) newErrors.receipt = "Payment receipt is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!receiptFile) return;

    try {
      // Upload receipt
      const blobId = await upload(receiptFile);

      // Submit registration
      await submitRegistration.mutateAsync({
        tournamentId,
        playerName: playerName.trim(),
        playerUid: playerUid.trim(),
        contactNumber: contactNumber.trim(),
        paymentReceiptBlobId: blobId,
      });

      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      toast.error(message);
    }
  };

  const isSubmitting = isUploading || submitRegistration.isPending;

  if (tournamentLoading) {
    return (
      <div
        data-ocid="register.loading_state"
        className="container mx-auto px-4 py-12 text-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading tournament details...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div
        data-ocid="register.error_state"
        className="container mx-auto px-4 py-12 text-center"
      >
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground">Tournament not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: "/" })}
        >
          Back to Tournaments
        </Button>
      </div>
    );
  }

  return (
    <main
      data-ocid="register.page"
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/" })}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Tournaments
      </Button>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            data-ocid="register.success_state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-gaming rounded-2xl p-12 text-center"
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
              Registration Submitted!
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Your registration is awaiting admin approval. You&apos;ll be
              notified once approved.
            </p>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Back to Tournaments
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Tournament Details */}
            <div className="card-gaming rounded-2xl p-6">
              <h1 className="font-display text-2xl font-black mb-4 gradient-text-gaming">
                {tournament.gameName} Tournament
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                    Date & Time
                  </p>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary/60" />
                    {formatDateTime(tournament.dateTime)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                    Entry Fee
                  </p>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-accent/60" />
                    {tournament.entryFee}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                    Prize Pool
                  </p>
                  <p className="text-sm font-bold text-gaming-gold flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    {tournament.prizePool}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                    Slots
                  </p>
                  <p className="text-sm font-semibold">
                    <span className="text-primary">
                      {Number(tournament.joinedSlots)}
                    </span>
                    <span className="text-muted-foreground">
                      /{Number(tournament.totalSlots)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="card-gaming rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-4 text-foreground">
                💳 Payment Instructions
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Send the exact entry fee of{" "}
                <strong className="text-foreground">
                  {tournament.entryFee}
                </strong>{" "}
                to the UPI ID below, then upload your payment receipt to
                complete registration.
              </p>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <div className="border-2 border-primary/30 rounded-xl overflow-hidden bg-white p-2 glow-green">
                    <img
                      src={QR_IMAGE}
                      alt="Payment QR Code"
                      className="w-48 h-48 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center font-mono">
                    Scan to Pay
                  </p>
                </div>

                {/* UPI Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-2 block">
                      UPI ID
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gaming-surface-2 border border-border rounded-lg px-4 py-3 font-mono text-lg text-primary font-semibold">
                        {UPI_ID}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyUpi}
                        className="border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <p className="text-sm text-foreground/90 font-medium mb-1">
                      ⚠️ Important
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Send exact entry fee amount</li>
                      <li>Take a screenshot of your payment confirmation</li>
                      <li>
                        Upload the screenshot below to complete registration
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit}
              className="card-gaming rounded-2xl p-6 space-y-5"
            >
              <h2 className="font-display text-xl font-bold text-foreground">
                📝 Player Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Player Name */}
                <div className="space-y-2">
                  <Label htmlFor="playerName" className="text-sm font-medium">
                    Player Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="playerName"
                    data-ocid="register.player_name.input"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-gaming-surface-2 border-border focus:border-primary/50"
                    disabled={isSubmitting}
                  />
                  {errors.playerName && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="register.player_name.error_state"
                    >
                      {errors.playerName}
                    </p>
                  )}
                </div>

                {/* In-Game UID */}
                <div className="space-y-2">
                  <Label htmlFor="playerUid" className="text-sm font-medium">
                    In-Game UID / Player ID{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="playerUid"
                    data-ocid="register.uid.input"
                    placeholder="e.g. 1234567890"
                    value={playerUid}
                    onChange={(e) => setPlayerUid(e.target.value)}
                    className="bg-gaming-surface-2 border-border focus:border-primary/50 font-mono"
                    disabled={isSubmitting}
                  />
                  {errors.playerUid && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="register.uid.error_state"
                    >
                      {errors.playerUid}
                    </p>
                  )}
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-medium">
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact"
                    data-ocid="register.contact.input"
                    placeholder="+91 XXXXXXXXXX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="bg-gaming-surface-2 border-border focus:border-primary/50"
                    disabled={isSubmitting}
                  />
                  {errors.contact && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="register.contact.error_state"
                    >
                      {errors.contact}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Receipt Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Payment Receipt Screenshot{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <label
                  htmlFor="receiptInput"
                  data-ocid="register.receipt.upload_button"
                  className="border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-6 text-center transition-colors cursor-pointer relative block"
                >
                  <input
                    id="receiptInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                  {receiptPreview ? (
                    <div className="space-y-3">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="mx-auto max-h-40 rounded-lg border border-border object-contain"
                      />
                      <p className="text-xs text-muted-foreground">
                        {receiptFile?.name} · Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm font-medium text-foreground">
                        Upload Payment Screenshot
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click to browse or drag & drop · JPG, PNG, WEBP
                      </p>
                    </div>
                  )}
                </label>
                {errors.receipt && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="register.receipt.error_state"
                  >
                    {errors.receipt}
                  </p>
                )}
                {isUploading && (
                  <div data-ocid="register.loading_state" className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading receipt...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress-gaming rounded-full h-1.5">
                      <div
                        className="progress-gaming-fill h-full rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                data-ocid="register.submit_button"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-12 glow-green"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isUploading
                      ? `Uploading... ${uploadProgress}%`
                      : "Submitting..."}
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
