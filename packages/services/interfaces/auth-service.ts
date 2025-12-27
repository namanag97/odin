import type { AsyncResult, UserId, RequestContext } from "@odin/core-contracts";
import type { User, Session } from "@odin/domain";
import type { IService, OperationContext } from "./base";

export interface IAuthService extends IService {
  // Authentication
  authenticate(input: AuthenticateInput, ctx: RequestContext): AsyncResult<AuthResult>;
  refreshToken(input: RefreshTokenInput, ctx: RequestContext): AsyncResult<AuthResult>;
  logout(sessionId: string, ctx: OperationContext): AsyncResult<void>;
  logoutAll(userId: UserId, ctx: OperationContext): AsyncResult<number>;

  // Password
  requestPasswordReset(email: string, ctx: RequestContext): AsyncResult<void>;
  resetPassword(input: ResetPasswordInput, ctx: RequestContext): AsyncResult<void>;
  changePassword(input: ChangePasswordInput, ctx: OperationContext): AsyncResult<void>;

  // MFA
  setupMfa(input: SetupMfaInput, ctx: OperationContext): AsyncResult<MfaSetupResult>;
  verifyMfa(input: VerifyMfaInput, ctx: RequestContext): AsyncResult<AuthResult>;
  disableMfa(userId: UserId, ctx: OperationContext): AsyncResult<void>;

  // SSO
  initiateSso(input: InitiateSsoInput, ctx: RequestContext): AsyncResult<SsoInitResult>;
  completeSso(input: CompleteSsoInput, ctx: RequestContext): AsyncResult<AuthResult>;

  // Sessions
  listSessions(userId: UserId, ctx: OperationContext): AsyncResult<readonly Session[]>;
  revokeSession(sessionId: string, ctx: OperationContext): AsyncResult<void>;

  // Validation
  validateToken(token: string, ctx: RequestContext): AsyncResult<AuthContext>;
  validateApiKey(key: string, ctx: RequestContext): AsyncResult<AuthContext>;
}

// DTOs
export type AuthMethod = 'password' | 'magic_link' | 'sso' | 'api_key';
export type MfaType = 'totp' | 'sms' | 'email';

export interface AuthContext {
  readonly userId: UserId;
  readonly tenantId: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export interface DeviceInfo {
  readonly userAgent: string;
  readonly ipAddress: string;
  readonly fingerprint?: string;
}

export type AuthCredentials =
  | { type: 'password'; email: string; password: string }
  | { type: 'magic_link'; token: string }
  | { type: 'api_key'; key: string };

export interface AuthenticateInput {
  readonly method: AuthMethod;
  readonly credentials: AuthCredentials;
  readonly deviceInfo?: DeviceInfo;
}

export interface AuthResult {
  readonly user: User;
  readonly session: Session;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt: string;
  readonly mfaRequired: boolean;
  readonly mfaPending?: boolean;
}

export interface RefreshTokenInput {
  readonly refreshToken: string;
  readonly deviceInfo?: DeviceInfo;
}

export interface ResetPasswordInput {
  readonly token: string;
  readonly newPassword: string;
}

export interface ChangePasswordInput {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export interface SetupMfaInput {
  readonly type: MfaType;
  readonly phoneNumber?: string;
}

export interface MfaSetupResult {
  readonly type: MfaType;
  readonly secret?: string;
  readonly qrCodeUrl?: string;
  readonly recoveryCodes?: readonly string[];
}

export interface VerifyMfaInput {
  readonly sessionId: string;
  readonly code: string;
  readonly type: MfaType;
}

export interface InitiateSsoInput {
  readonly providerId: string;
  readonly redirectUrl: string;
}

export interface SsoInitResult {
  readonly authorizationUrl: string;
  readonly state: string;
}

export interface CompleteSsoInput {
  readonly providerId: string;
  readonly code: string;
  readonly state: string;
}
