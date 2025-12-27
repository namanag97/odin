/**
 * Coupon Repository Interface - Commercial Layer
 * 
 * Data access contract for Coupon entities.
 */

import type { 
  UUID,
  TenantId,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Coupon,
  CouponRedemption,
  CreateCouponData, 
  UpdateCouponData,
  RedeemCouponData
} from '../../entities/commercial/coupon';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * ICouponRepository - Coupon data access contract
 */
export interface ICouponRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a coupon by ID
   */
  findById(id: UUID): AsyncResult<Coupon | null>;
  
  /**
   * Find a coupon by code
   */
  findByCode(code: string): AsyncResult<Coupon | null>;
  
  /**
   * Find all active coupons
   */
  findActive(options?: PageRequest): AsyncResult<PageResponse<Coupon>>;
  
  /**
   * Find coupons applicable to a specific plan
   */
  findByPlanId(planId: UUID): AsyncResult<readonly Coupon[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new coupon
   */
  create(data: CreateCouponData): AsyncResult<Coupon>;
  
  /**
   * Update coupon fields
   */
  update(id: UUID, data: UpdateCouponData): AsyncResult<Coupon>;
  
  /**
   * Deactivate a coupon
   */
  deactivate(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Redemption
  // -------------------------------------------------------------------------
  
  /**
   * Validate if a coupon can be used
   */
  validate(code: string, planId: UUID): AsyncResult<Coupon>;
  
  /**
   * Redeem a coupon for a subscription
   */
  redeem(data: RedeemCouponData): AsyncResult<CouponRedemption>;
  
  /**
   * Get all redemptions for a coupon
   */
  getRedemptions(couponId: UUID): AsyncResult<readonly CouponRedemption[]>;
  
  /**
   * Get all redemptions for a tenant
   */
  getRedemptionsByTenant(tenantId: TenantId): AsyncResult<readonly CouponRedemption[]>;
}
