import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Registration, Tournament } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Tournaments ─────────────────────────────────────────────────────────────

export function useActiveTournaments(refetchInterval?: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament[]>({
    queryKey: ["activeTournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveTournaments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: refetchInterval ?? false,
  });
}

export function useAllTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament[]>({
    queryKey: ["allTournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTournaments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTournamentById(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament | null>({
    queryKey: ["tournament", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return null;
      return actor.getTournamentById(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

export function useCreateTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      gameName,
      dateTime,
      totalSlots,
      entryFee,
      prizePool,
    }: {
      gameName: string;
      dateTime: string;
      totalSlots: bigint;
      entryFee: string;
      prizePool: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTournament(
        gameName,
        dateTime,
        totalSlots,
        entryFee,
        prizePool,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
    },
  });
}

export function useUpdateTournamentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      newStatus,
    }: {
      tournamentId: bigint;
      newStatus: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTournamentStatus(tournamentId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
    },
  });
}

// ─── Registrations ────────────────────────────────────────────────────────────

export function useAllRegistrations(filterTournamentId: bigint | null = null) {
  const { actor, isFetching } = useActor();
  return useQuery<Registration[]>({
    queryKey: ["registrations", filterTournamentId?.toString() ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegistrations(filterTournamentId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      playerName,
      playerUid,
      contactNumber,
      paymentReceiptBlobId,
    }: {
      tournamentId: bigint;
      playerName: string;
      playerUid: string;
      contactNumber: string;
      paymentReceiptBlobId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRegistration(
        tournamentId,
        playerName,
        playerUid,
        contactNumber,
        paymentReceiptBlobId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

export function useApproveRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveRegistration(registrationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
    },
  });
}

export function useDisapproveRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.disapproveRegistration(registrationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "anonymous";
  return useQuery<boolean>({
    queryKey: ["isAdmin", principal],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}
