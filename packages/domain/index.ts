/**
 * @odin/domain — L1 Domain Layer
 * 
 * Domain-Driven Design implementation for the Process Intelligence Platform.
 * 
 * ## Ontological Layers
 * 
 * - **Existence** — Tenants, Organizations, Environments
 * - **Identity** — Users, Roles, Sessions, Teams, MFA, IdPs
 * - **Commercial** — Plans, Subscriptions, Invoices, Payments, Usage, Coupons
 * - **Operational** — Settings, Feature Flags, System Config
 * 
 * ## Design Principles
 * 
 * - Pure contracts (no infrastructure dependencies)
 * - Immutable entities (all fields readonly)
 * - Result-based operations (AsyncResult<T>)
 * - Multi-tenant by default (TenantId on all aggregates)
 * 
 * @packageDocumentation
 */

// ============================================================================
// ENTITIES
// Core domain objects with identity and lifecycle
// ============================================================================

export * from './entities';

// ============================================================================
// REPOSITORIES
// Data access contracts (interfaces only, implementations in infra layer)
// ============================================================================

export * from './repositories';

// ============================================================================
// DOMAIN EVENTS
// Events published when domain state changes
// ============================================================================

export * from './events';

