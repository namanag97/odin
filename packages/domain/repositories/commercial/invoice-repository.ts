/**
 * Invoice Repository Interface - Commercial Layer
 * 
 * Data access contract for Invoice entities.
 */

import type { 
  UUID,
  TenantId,
  AsyncResult,
  DateRange,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Invoice,
  InvoiceStatus,
  CreateInvoiceData, 
  UpdateInvoiceData 
} from '../../entities/commercial/invoice';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IInvoiceRepository - Invoice data access contract
 */
export interface IInvoiceRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an invoice by ID
   */
  findById(id: UUID): AsyncResult<Invoice | null>;
  
  /**
   * Find an invoice by number
   */
  findByNumber(number: string): AsyncResult<Invoice | null>;
  
  /**
   * Find all invoices for a tenant
   */
  findByTenantId(
    tenantId: TenantId, 
    options?: PageRequest
  ): AsyncResult<PageResponse<Invoice>>;
  
  /**
   * Find all invoices for a subscription
   */
  findBySubscriptionId(subscriptionId: UUID): AsyncResult<readonly Invoice[]>;
  
  /**
   * Find invoices by status
   */
  findByStatus(status: InvoiceStatus): AsyncResult<readonly Invoice[]>;
  
  /**
   * Find invoices within a date range
   */
  findByDateRange(
    tenantId: TenantId, 
    range: DateRange
  ): AsyncResult<readonly Invoice[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new invoice
   */
  create(data: CreateInvoiceData): AsyncResult<Invoice>;
  
  /**
   * Update invoice fields
   */
  update(id: UUID, data: UpdateInvoiceData): AsyncResult<Invoice>;
  
  /**
   * Mark an invoice as paid
   */
  markPaid(id: UUID, paidAt: string): AsyncResult<Invoice>;
  
  /**
   * Void an invoice
   */
  void(id: UUID): AsyncResult<Invoice>;

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------
  
  /**
   * Generate the next invoice number
   */
  generateNumber(): AsyncResult<string>;
}
