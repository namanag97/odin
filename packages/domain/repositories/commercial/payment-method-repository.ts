/**
 * PaymentMethod Repository Interface - Commercial Layer
 * 
 * Data access contract for PaymentMethod entities.
 */

import type { 
  UUID,
  TenantId,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  PaymentMethod,
  CreatePaymentMethodData, 
  UpdatePaymentMethodData 
} from '../../entities/commercial/payment-method';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IPaymentMethodRepository - PaymentMethod data access contract
 */
export interface IPaymentMethodRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a payment method by ID
   */
  findById(id: UUID): AsyncResult<PaymentMethod | null>;
  
  /**
   * Find all payment methods for a tenant
   */
  findByTenantId(tenantId: TenantId): AsyncResult<readonly PaymentMethod[]>;
  
  /**
   * Find the default payment method for a tenant
   */
  findDefault(tenantId: TenantId): AsyncResult<PaymentMethod | null>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new payment method
   */
  create(data: CreatePaymentMethodData): AsyncResult<PaymentMethod>;
  
  /**
   * Update payment method fields
   */
  update(id: UUID, data: UpdatePaymentMethodData): AsyncResult<PaymentMethod>;
  
  /**
   * Set a payment method as default
   */
  setDefault(id: UUID): AsyncResult<PaymentMethod>;
  
  /**
   * Delete a payment method
   */
  delete(id: UUID): AsyncResult<void>;
}
