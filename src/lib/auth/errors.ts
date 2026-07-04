export type AuthErrorReason = "UNAUTHENTICATED" | "FORBIDDEN";

/** Se lanza cuando una acción de servidor no cumple auth/autorización. */
export class AuthorizationError extends Error {
  constructor(public readonly reason: AuthErrorReason) {
    super(reason);
    this.name = "AuthorizationError";
  }
}
