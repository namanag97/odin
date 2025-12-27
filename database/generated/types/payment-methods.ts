export type PaymentMethodsType = "card" | "bank_account" | "invoice" | "paypal" | "other";
export type PaymentMethodsProvider = "stripe" | "braintree" | "adyen" | "manual";

/**
 * Represents a row in the payment_methods table
 * Source: 22_commercial_layer.sql
 */
export interface PaymentMethods {
  /** Primary key */
  id: string;
  tenant_id: string;
  external_id: string;
  type: PaymentMethodsType;
  provider: PaymentMethodsProvider;
  is_default: number;
  last_four: string | null;
  brand: string | null;
  exp_month: number | null;
  exp_year: number | null;
  billing_address: string | null;
  created_at: string;
}

/** Insert type for payment_methods (excludes auto-generated fields) */
export interface PaymentMethodsInsert {
  tenant_id: string;
  external_id: string;
  type: PaymentMethodsType;
  provider: PaymentMethodsProvider;
  is_default?: number;
  last_four?: string | null;
  brand?: string | null;
  exp_month?: number | null;
  exp_year?: number | null;
  billing_address?: string | null;
}