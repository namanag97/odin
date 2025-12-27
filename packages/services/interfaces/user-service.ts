import type { AsyncResult, UserId, RoleId, OrganizationId } from "@odin/core-contracts";
import type { User, Role } from "@odin/domain";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig } from "./tenant-service";

export interface IUserService extends IService {
  // Queries
  getUser(id: UserId, ctx: OperationContext): AsyncResult<User>;
  getUserByEmail(email: string, ctx: OperationContext): AsyncResult<User>;
  listUsers(input: ListUsersInput, ctx: OperationContext): AsyncResult<PaginatedResult<User>>;
  getUserProfile(userId: UserId, ctx: OperationContext): AsyncResult<UserProfile>;

  // Commands
  createUser(input: CreateUserInput, ctx: OperationContext): AsyncResult<User>;
  updateUser(input: UpdateUserInput, ctx: OperationContext): AsyncResult<User>;
  updateProfile(input: UpdateProfileInput, ctx: OperationContext): AsyncResult<UserProfile>;
  suspendUser(input: SuspendUserInput, ctx: OperationContext): AsyncResult<User>;
  reactivateUser(userId: UserId, ctx: OperationContext): AsyncResult<User>;
  deleteUser(userId: UserId, ctx: OperationContext): AsyncResult<void>;

  // Roles
  assignRole(input: AssignRoleInput, ctx: OperationContext): AsyncResult<void>;
  revokeRole(input: RevokeRoleInput, ctx: OperationContext): AsyncResult<void>;
  getUserRoles(userId: UserId, ctx: OperationContext): AsyncResult<readonly Role[]>;
  getUserPermissions(userId: UserId, ctx: OperationContext): AsyncResult<readonly string[]>;

  // Invitations
  inviteUser(input: InviteUserInput, ctx: OperationContext): AsyncResult<UserInvitation>;
  acceptInvitation(input: AcceptInvitationInput, ctx: OperationContext): AsyncResult<User>;
  cancelInvitation(invitationId: string, ctx: OperationContext): AsyncResult<void>;
  listPendingInvitations(ctx: OperationContext): AsyncResult<readonly UserInvitation[]>;
}

// DTOs
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type AuthMethod = 'password' | 'sso' | 'oauth';

export interface UserProfile {
  readonly userId: UserId;
  readonly displayName?: string;
  readonly jobTitle?: string;
  readonly department?: string;
  readonly timezone?: string;
  readonly locale?: string;
  readonly preferences?: UserPreferences;
}

export interface UserPreferences {
  readonly theme?: 'light' | 'dark' | 'auto';
  readonly notifications?: NotificationPreferences;
  readonly [key: string]: unknown;
}

export interface NotificationPreferences {
  readonly email?: boolean;
  readonly push?: boolean;
  readonly inApp?: boolean;
}

export interface CreateUserInput {
  readonly email: string;
  readonly name: string;
  readonly password?: string;
  readonly authMethod: AuthMethod;
  readonly roleIds?: readonly RoleId[];
  readonly organizationId?: OrganizationId;
  readonly sendWelcomeEmail?: boolean;
}

export interface UpdateUserInput {
  readonly userId: UserId;
  readonly name?: string;
  readonly email?: string;
}

export interface UpdateProfileInput {
  readonly userId: UserId;
  readonly displayName?: string;
  readonly jobTitle?: string;
  readonly department?: string;
  readonly timezone?: string;
  readonly locale?: string;
  readonly preferences?: Partial<UserPreferences>;
}

export interface ListUsersInput {
  readonly status?: UserStatus;
  readonly organizationId?: OrganizationId;
  readonly roleId?: RoleId;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface SuspendUserInput {
  readonly userId: UserId;
  readonly reason: string;
  readonly revokeAllSessions: boolean;
}

export interface AssignRoleInput {
  readonly userId: UserId;
  readonly roleId: RoleId;
  readonly expiresAt?: string;
}

export interface RevokeRoleInput {
  readonly userId: UserId;
  readonly roleId: RoleId;
}

export interface InviteUserInput {
  readonly email: string;
  readonly name: string;
  readonly roleIds: readonly RoleId[];
  readonly organizationId?: OrganizationId;
  readonly message?: string;
  readonly expiresInDays?: number;
}

export interface UserInvitation {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly roleIds: readonly RoleId[];
  readonly invitedBy: UserId;
  readonly status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  readonly expiresAt: string;
  readonly createdAt: string;
}

export interface AcceptInvitationInput {
  readonly token: string;
  readonly password: string;
}
