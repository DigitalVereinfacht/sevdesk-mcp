/**
 * Export Tools
 * MCP tools for sevdesk DATEV and CSV exports
 */

import { z } from "zod";
import { sevdeskFetch, buildQueryString } from "../api.js";

// ============================================================================
// Schemas
// ============================================================================

/**
 * DATEV export schema (v2.0 — uses /Export/datevCSV with EXTCD scope)
 */
export const exportDatevSchema = {
  startDate: z.string().describe("Export start date (YYYY-MM-DD)"),
  endDate: z.string().describe("Export end date (YYYY-MM-DD)"),
  scope: z.string().optional().describe("Scope string: combine letters E=Earnings, X=Expenditure, T=Transactions, C=Cashregister, D=Assets (e.g. 'EXTCD' for all, 'EX' for earnings+expenditure). Default: 'EXTCD'"),
  withEnshrined: z.boolean().optional().describe("Include already enshrined/exported records (default: false)"),
  withUnpaidDocuments: z.boolean().optional().describe("Include unpaid documents (default: false)"),
  enshrine: z.boolean().optional().describe("Enshrine (lock) records after export (default: false)"),
};

/**
 * Invoice CSV export schema
 */
export const exportInvoiceCsvSchema = {
  startDate: z.string().optional().describe("Filter invoices from this date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter invoices until this date (YYYY-MM-DD)"),
};

/**
 * Voucher list CSV export schema
 */
export const exportVoucherListCsvSchema = {
  startDate: z.string().optional().describe("Filter vouchers from this date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter vouchers until this date (YYYY-MM-DD)"),
};

/**
 * Transactions CSV export schema
 */
export const exportTransactionsCsvSchema = {
  startDate: z.string().optional().describe("Filter transactions from this date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Filter transactions until this date (YYYY-MM-DD)"),
  checkAccountId: z.string().optional().describe("Filter by specific bank account ID"),
};

// ============================================================================
// Functions
// ============================================================================

interface DatevExportResponse {
  objects: {
    content?: string;
    filename?: string;
    base64?: string;
  };
}

/**
 * Export DATEV data (booking records) — v2.0 endpoint /Export/datevCSV
 */
export async function exportDatev(params: {
  startDate: string;
  endDate: string;
  scope?: string;
  withEnshrined?: boolean;
  withUnpaidDocuments?: boolean;
  enshrine?: boolean;
}): Promise<string> {
  const queryString = buildQueryString({
    scope: params.scope || "EXTCD",
    start_date: params.startDate,
    end_date: params.endDate,
    with_enshrined_documents: params.withEnshrined ?? false,
    with_unpaid_documents: params.withUnpaidDocuments ?? false,
    enshrine: params.enshrine ?? false,
    download: true,
  });

  const response = await sevdeskFetch<DatevExportResponse>(`/Export/datevCSV${queryString}`);
  return JSON.stringify(response.objects);
}

/**
 * Export invoices as CSV
 */
export async function exportInvoiceCsv(params: {
  startDate?: string;
  endDate?: string;
}): Promise<string> {
  const queryParams: Record<string, string | boolean | undefined> = {
    download: true,
  };
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;

  const queryString = buildQueryString(queryParams);
  const response = await sevdeskFetch<DatevExportResponse>(`/Export/invoiceCsv${queryString}`);
  return JSON.stringify(response.objects);
}

/**
 * Export voucher list as CSV
 */
export async function exportVoucherListCsv(params: {
  startDate?: string;
  endDate?: string;
}): Promise<string> {
  const queryParams: Record<string, string | boolean | undefined> = {
    download: true,
  };
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;

  const queryString = buildQueryString(queryParams);
  const response = await sevdeskFetch<DatevExportResponse>(`/Export/voucherListCsv${queryString}`);
  return JSON.stringify(response.objects);
}

/**
 * Export transactions as CSV
 */
export async function exportTransactionsCsv(params: {
  startDate?: string;
  endDate?: string;
  checkAccountId?: string;
}): Promise<string> {
  const queryParams: Record<string, string | boolean | undefined> = {
    download: true,
  };
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;
  if (params.checkAccountId) queryParams["checkAccount[id]"] = params.checkAccountId;

  const queryString = buildQueryString(queryParams);
  const response = await sevdeskFetch<DatevExportResponse>(`/Export/transactionsCsv${queryString}`);
  return JSON.stringify(response.objects);
}

// ============================================================================
// Formatters
// ============================================================================

/**
 * Format DATEV export result
 */
export function formatDatevExportResult(data: string): string {
  return `DATEV export completed successfully.\nResponse: ${data.substring(0, 500)}${data.length > 500 ? "..." : ""}`;
}

/**
 * Format CSV export result
 */
export function formatCsvExportResult(data: string, type: string): string {
  return `${type} CSV export completed successfully.\nResponse: ${data.substring(0, 500)}${data.length > 500 ? "..." : ""}`;
}
