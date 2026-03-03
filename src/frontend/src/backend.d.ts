import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Registration {
    id: bigint;
    playerUid: string;
    status: string;
    paymentReceiptBlobId: string;
    createdAt: bigint;
    playerName: string;
    contactNumber: string;
    tournamentId: bigint;
}
export interface Tournament {
    id: bigint;
    status: string;
    createdAt: bigint;
    joinedSlots: bigint;
    totalSlots: bigint;
    gameName: string;
    entryFee: string;
    dateTime: string;
    prizePool: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveRegistration(registrationId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTournament(gameName: string, dateTime: string, totalSlots: bigint, entryFee: string, prizePool: string): Promise<Tournament>;
    disapproveRegistration(registrationId: bigint): Promise<void>;
    getActiveTournaments(): Promise<Array<Tournament>>;
    getAllRegistrations(filterTournamentId: bigint | null): Promise<Array<Registration>>;
    getAllTournaments(): Promise<Array<Tournament>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTournamentById(tournamentId: bigint): Promise<Tournament>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRegistration(tournamentId: bigint, playerName: string, playerUid: string, contactNumber: string, paymentReceiptBlobId: string): Promise<Registration>;
    updateTournamentStatus(tournamentId: bigint, newStatus: string): Promise<void>;
}
