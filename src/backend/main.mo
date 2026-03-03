import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // This must be at the top with no dependency on local state (no let or var)
  include MixinStorage();

  // Components: Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Persistent storage for tournaments and registrations
  var nextTournamentId = 1;
  var nextRegistrationId = 1;

  // Types
  public type Tournament = {
    id : Nat;
    gameName : Text;
    dateTime : Text;
    totalSlots : Nat;
    joinedSlots : Nat;
    entryFee : Text;
    prizePool : Text;
    status : Text; // "active" or "inactive"
    createdAt : Int;
  };

  module Tournament {
    public func compare(t1 : Tournament, t2 : Tournament) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };

  public type Registration = {
    id : Nat;
    tournamentId : Nat;
    playerName : Text;
    playerUid : Text;
    contactNumber : Text;
    createdAt : Int;
    paymentReceiptBlobId : Text; // Reference to backend/blob-storage
    status : Text; // "pending", "approved", "disapproved"
  };

  module Registration {
    public func compare(r1 : Registration, r2 : Registration) : Order.Order {
      Nat.compare(r1.id, r2.id);
    };
  };

  let tournaments = Map.empty<Nat, Tournament>();
  let registrations = Map.empty<Nat, Registration>();

  // Admin only: Create tournament
  public shared ({ caller }) func createTournament(gameName : Text, dateTime : Text, totalSlots : Nat, entryFee : Text, prizePool : Text) : async Tournament {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let tournament : Tournament = {
      id = nextTournamentId;
      gameName;
      dateTime;
      totalSlots;
      joinedSlots = 0;
      entryFee;
      prizePool;
      status = "active";
      createdAt = Time.now();
    };

    tournaments.add(nextTournamentId, tournament);
    nextTournamentId += 1;

    tournament;
  };

  // Public: List all active tournaments
  public query func getActiveTournaments() : async [Tournament] {
    tournaments.values().toArray().filter(func(t) { t.status == "active" }).sort();
  };

  // Admin only: List all tournaments (no filter)
  public query ({ caller }) func getAllTournaments() : async [Tournament] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    tournaments.values().toArray().sort();
  };

  // Public: Get single tournament by id
  public query func getTournamentById(tournamentId : Nat) : async Tournament {
    switch (tournaments.get(tournamentId)) {
      case (null) {
        Runtime.trap("Tournament not found");
      };
      case (?tournament) {
        tournament;
      };
    };
  };

  // Any user: Submit registration for a tournament (returns created registration)
  public shared func submitRegistration(tournamentId : Nat, playerName : Text, playerUid : Text, contactNumber : Text, paymentReceiptBlobId : Text) : async Registration {
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let registration : Registration = {
          id = nextRegistrationId;
          tournamentId;
          playerName;
          playerUid;
          contactNumber;
          paymentReceiptBlobId;
          status = "pending";
          createdAt = Time.now();
        };

        registrations.add(nextRegistrationId, registration);
        nextRegistrationId += 1;

        registration;
      };
    };
  };

  // Admin only: List all registrations (optional filter by tournamentId)
  public query ({ caller }) func getAllRegistrations(filterTournamentId : ?Nat) : async [Registration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let filtered = switch (filterTournamentId) {
      case (null) { registrations.values().toArray() };
      case (?id) {
        registrations.values().toArray().filter(
          func(r) {
            r.tournamentId == id;
          }
        );
      };
    };

    filtered.sort();
  };

  // Admin only: Approve registration and update tournament joinedSlots
  public shared ({ caller }) func approveRegistration(registrationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (registrations.get(registrationId)) {
      case (null) { Runtime.trap("Registration not found") };
      case (?registration) {
        if (registration.status == "approved") { Runtime.trap("Registration already approved") };

        registrations.add(
          registrationId,
          {
            id = registration.id;
            tournamentId = registration.tournamentId;
            playerName = registration.playerName;
            playerUid = registration.playerUid;
            contactNumber = registration.contactNumber;
            paymentReceiptBlobId = registration.paymentReceiptBlobId;
            status = "approved";
            createdAt = registration.createdAt;
          },
        );

        switch (tournaments.get(registration.tournamentId)) {
          case (null) { Runtime.trap("Tournament not found") };
          case (?tournament) {
            if (tournament.joinedSlots >= tournament.totalSlots) {
              Runtime.trap("Tournament is full");
            };
            tournaments.add(
              registration.tournamentId,
              {
                id = tournament.id;
                gameName = tournament.gameName;
                dateTime = tournament.dateTime;
                totalSlots = tournament.totalSlots;
                joinedSlots = tournament.joinedSlots + 1;
                entryFee = tournament.entryFee;
                prizePool = tournament.prizePool;
                status = tournament.status;
                createdAt = tournament.createdAt;
              },
            );
          };
        };
      };
    };
  };

  // Admin only: Disapprove registration
  public shared ({ caller }) func disapproveRegistration(registrationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (registrations.get(registrationId)) {
      case (null) { Runtime.trap("Registration not found") };
      case (?registration) {
        if (registration.status == "disapproved") { Runtime.trap("Registration already disapproved") };

        registrations.add(
          registrationId,
          {
            id = registration.id;
            tournamentId = registration.tournamentId;
            playerName = registration.playerName;
            playerUid = registration.playerUid;
            contactNumber = registration.contactNumber;
            paymentReceiptBlobId = registration.paymentReceiptBlobId;
            status = "disapproved";
            createdAt = registration.createdAt;
          },
        );
      };
    };
  };

  // Admin only: Update tournament status
  public shared ({ caller }) func updateTournamentStatus(tournamentId : Nat, newStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        if (tournament.status == newStatus) { Runtime.trap("Tournament already has this status") };
        tournaments.add(
          tournamentId,
          {
            id = tournament.id;
            gameName = tournament.gameName;
            dateTime = tournament.dateTime;
            totalSlots = tournament.totalSlots;
            joinedSlots = tournament.joinedSlots;
            entryFee = tournament.entryFee;
            prizePool = tournament.prizePool;
            status = newStatus;
            createdAt = tournament.createdAt;
          },
        );
      };
    };
  };
};
