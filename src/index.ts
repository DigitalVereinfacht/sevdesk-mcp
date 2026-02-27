#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import contact tools
import {
  listContactsSchema,
  getContactSchema,
  createContactSchema,
  updateContactSchema,
  deleteContactSchema,
  getNextCustomerNumberSchema,
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getNextCustomerNumber,
  formatContactsList,
  formatContact,
  formatContactResult,
  formatDeleteResult as formatContactDeleteResult,
  formatNextCustomerNumber,
} from "./tools/contacts.js";

// Import invoice tools
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  createRecurringInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
  getInvoicePdfSchema,
  sendInvoiceEmailSchema,
  resetInvoiceToDraftSchema,
  resetInvoiceToOpenSchema,
  markInvoiceSentSchema,
  enshrineInvoiceSchema,
  bookInvoicePaymentSchema,
  listInvoicePositionsSchema,
  getInvoicePositionSchema,
  createInvoicePositionSchema,
  updateInvoicePositionSchema,
  deleteInvoicePositionSchema,
  listInvoices,
  getInvoice,
  createInvoice,
  createRecurringInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicePdf,
  sendInvoiceEmail,
  resetInvoiceToDraft,
  resetInvoiceToOpen,
  markInvoiceSent,
  enshrineInvoice,
  bookInvoicePayment,
  listInvoicePositions,
  getInvoicePosition,
  createInvoicePosition,
  updateInvoicePosition,
  deleteInvoicePosition,
  formatInvoicesList,
  formatInvoice,
  formatInvoiceResult,
  formatRecurringInvoiceResult,
  formatInvoiceDeleteResult,
  formatPdfResult,
  formatEmailSentResult,
  formatStatusChangeResult,
  formatInvoiceEnshrineResult,
  formatPaymentBookedResult,
  formatInvoicePositionsList,
  formatInvoicePosition,
  formatPositionResult,
  formatPositionDeleteResult,
} from "./tools/invoices.js";

// Import voucher tools
import {
  listVouchersSchema,
  getVoucherSchema,
  uploadVoucherFileSchema,
  createVoucherSchema,
  updateVoucherSchema,
  deleteVoucherSchema,
  bookVoucherPaymentSchema,
  enshrineVoucherSchema,
  listVoucherPositionsSchema,
  getVoucherPositionSchema,
  createVoucherPositionSchema,
  updateVoucherPositionSchema,
  deleteVoucherPositionSchema,
  listVouchers,
  getVoucher,
  uploadVoucherFile,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  bookVoucherPayment,
  enshrineVoucher,
  listVoucherPositions,
  getVoucherPosition,
  createVoucherPosition,
  updateVoucherPosition,
  deleteVoucherPosition,
  formatVouchersList,
  formatVoucher,
  formatUploadResult,
  formatVoucherResult,
  formatVoucherDeleteResult,
  formatVoucherPaymentResult,
  formatEnshrineResult,
  formatVoucherPositionsList,
  formatVoucherPosition,
  formatVoucherPositionResult,
  formatVoucherPositionDeleteResult,
} from "./tools/vouchers.js";

// Import account tools
import {
  listCheckAccountsSchema,
  getCheckAccountBalanceSchema,
  getCheckAccountSchema,
  createCheckAccountSchema,
  updateCheckAccountSchema,
  deleteCheckAccountSchema,
  listTransactionsSchema,
  getTransactionSchema,
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  listCheckAccounts,
  getCheckAccountBalance,
  getCheckAccount,
  createCheckAccount,
  updateCheckAccount,
  deleteCheckAccount,
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  formatCheckAccountsList,
  formatCheckAccount,
  formatBalance,
  formatCheckAccountResult,
  formatCheckAccountDeleteResult,
  formatTransactionsList,
  formatTransaction,
  formatTransactionResult,
  formatTransactionDeleteResult,
} from "./tools/accounts.js";

// Import order tools
import {
  listOrdersSchema,
  getOrderSchema,
  createOrderSchema,
  updateOrderSchema,
  deleteOrderSchema,
  getOrderPdfSchema,
  sendOrderEmailSchema,
  changeOrderStatusSchema,
  listOrderPositionsSchema,
  getOrderPositionSchema,
  createOrderPositionSchema,
  updateOrderPositionSchema,
  deleteOrderPositionSchema,
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderPdf,
  sendOrderEmail,
  changeOrderStatus,
  listOrderPositions,
  getOrderPosition,
  createOrderPosition,
  updateOrderPosition,
  deleteOrderPosition,
  formatOrdersList,
  formatOrder,
  formatOrderResult,
  formatOrderDeleteResult,
  formatOrderPdfResult,
  formatOrderEmailSentResult,
  formatOrderStatusChangeResult,
  formatOrderPositionsList,
  formatOrderPosition,
  formatOrderPositionResult,
  formatOrderPositionDeleteResult,
} from "./tools/orders.js";

// Import credit note tools
import {
  listCreditNotesSchema,
  getCreditNoteSchema,
  createCreditNoteSchema,
  updateCreditNoteSchema,
  deleteCreditNoteSchema,
  getCreditNotePdfSchema,
  resetCreditNoteToDraftSchema,
  resetCreditNoteToOpenSchema,
  sendCreditNoteEmailSchema,
  listCreditNotePositionsSchema,
  getCreditNotePositionSchema,
  createCreditNotePositionSchema,
  updateCreditNotePositionSchema,
  deleteCreditNotePositionSchema,
  listCreditNotes,
  getCreditNote,
  createCreditNote,
  updateCreditNote,
  deleteCreditNote,
  getCreditNotePdf,
  resetCreditNoteToDraft,
  resetCreditNoteToOpen,
  sendCreditNoteEmail,
  listCreditNotePositions,
  getCreditNotePosition,
  createCreditNotePosition,
  updateCreditNotePosition,
  deleteCreditNotePosition,
  formatCreditNotesList,
  formatCreditNote,
  formatCreditNoteResult,
  formatCreditNoteDeleteResult,
  formatCreditNotePdfResult,
  formatCreditNoteStatusChangeResult,
  formatCreditNoteEmailSentResult,
  formatCreditNotePositionsList,
  formatCreditNotePosition,
  formatCreditNotePositionResult,
  formatCreditNotePositionDeleteResult,
} from "./tools/creditnotes.js";

// Import export tools
import {
  exportDatevSchema,
  exportInvoiceCsvSchema,
  exportVoucherListCsvSchema,
  exportTransactionsCsvSchema,
  exportDatev,
  exportInvoiceCsv,
  exportVoucherListCsv,
  exportTransactionsCsv,
  formatDatevExportResult,
  formatCsvExportResult,
} from "./tools/exports.js";

// Import part tools
import {
  listPartsSchema,
  getPartSchema,
  createPartSchema,
  updatePartSchema,
  deletePartSchema,
  getPartStockSchema,
  listParts,
  getPart,
  createPart,
  updatePart,
  deletePart,
  getPartStock,
  formatPartsList,
  formatPart,
  formatPartResult,
  formatPartDeleteResult,
  formatStockResult,
} from "./tools/parts.js";

// Import tag tools
import {
  listTagsSchema,
  getTagSchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  listTagRelationsSchema,
  addTagToObjectSchema,
  removeTagFromObjectSchema,
  listTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  listTagRelations,
  addTagToObject,
  removeTagFromObject,
  formatTagsList,
  formatTag,
  formatTagResult,
  formatTagDeleteResult,
  formatTagRelationsList,
  formatTagRelationResult,
  formatTagRelationDeleteResult,
} from "./tools/tags.js";

// Import address tools
import {
  listContactAddressesSchema,
  getContactAddressSchema,
  createContactAddressSchema,
  updateContactAddressSchema,
  deleteContactAddressSchema,
  listContactAddresses,
  getContactAddress,
  createContactAddress,
  updateContactAddress,
  deleteContactAddress,
  formatContactAddressesList,
  formatContactAddress,
  formatContactAddressResult,
  formatContactAddressDeleteResult,
} from "./tools/addresses.js";

// Import communication way tools
import {
  listCommunicationWaysSchema,
  getCommunicationWaySchema,
  createCommunicationWaySchema,
  updateCommunicationWaySchema,
  deleteCommunicationWaySchema,
  listCommunicationWays,
  getCommunicationWay,
  createCommunicationWay,
  updateCommunicationWay,
  deleteCommunicationWay,
  formatCommunicationWaysList,
  formatCommunicationWay,
  formatCommunicationWayResult,
  formatCommunicationWayDeleteResult,
} from "./tools/communication.js";

// Create MCP server instance
const server = new McpServer({
  name: "sevdesk-mcp",
  version: "2.0.0",
});

// Helper for error handling
function handleError(error: unknown, operation: string): { content: [{ type: "text"; text: string }]; isError: true } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text", text: `Error ${operation}: ${errorMessage}` }],
    isError: true,
  };
}

// ============================================================================
// Contact Tools
// ============================================================================

server.tool("list_contacts", "List contacts (customers, suppliers, partners) from sevdesk", listContactsSchema, async (params) => {
  try {
    const contacts = await listContacts(params);
    return { content: [{ type: "text", text: formatContactsList(contacts) }] };
  } catch (error) {
    return handleError(error, "listing contacts");
  }
});

server.tool("get_contact", "Get a specific contact by ID from sevdesk", getContactSchema, async (params) => {
  try {
    const contact = await getContact(params);
    return { content: [{ type: "text", text: formatContact(contact) }] };
  } catch (error) {
    return handleError(error, "getting contact");
  }
});

server.tool("create_contact", "Create a new contact (customer/supplier/partner) in sevdesk", createContactSchema, async (params) => {
  try {
    const contact = await createContact(params);
    return { content: [{ type: "text", text: formatContactResult(contact, "created") }] };
  } catch (error) {
    return handleError(error, "creating contact");
  }
});

server.tool("update_contact", "Update an existing contact in sevdesk", updateContactSchema, async (params) => {
  try {
    const contact = await updateContact(params);
    return { content: [{ type: "text", text: formatContactResult(contact, "updated") }] };
  } catch (error) {
    return handleError(error, "updating contact");
  }
});

server.tool("delete_contact", "Delete a contact from sevdesk", deleteContactSchema, async (params) => {
  try {
    await deleteContact(params);
    return { content: [{ type: "text", text: formatContactDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting contact");
  }
});

server.tool("get_next_customer_number", "Get the next available customer number from sevdesk", getNextCustomerNumberSchema, async () => {
  try {
    const number = await getNextCustomerNumber();
    return { content: [{ type: "text", text: formatNextCustomerNumber(number) }] };
  } catch (error) {
    return handleError(error, "getting next customer number");
  }
});

// ============================================================================
// Invoice Tools
// ============================================================================

server.tool("list_invoices", "List sales invoices from sevdesk", listInvoicesSchema, async (params) => {
  try {
    const invoices = await listInvoices(params);
    return { content: [{ type: "text", text: formatInvoicesList(invoices) }] };
  } catch (error) {
    return handleError(error, "listing invoices");
  }
});

server.tool("get_invoice", "Get a specific invoice by ID from sevdesk", getInvoiceSchema, async (params) => {
  try {
    const invoice = await getInvoice(params);
    return { content: [{ type: "text", text: formatInvoice(invoice) }] };
  } catch (error) {
    return handleError(error, "getting invoice");
  }
});

server.tool("create_invoice", "Create a new invoice in sevdesk", createInvoiceSchema, async (params) => {
  try {
    const invoice = await createInvoice(params);
    return { content: [{ type: "text", text: formatInvoiceResult(invoice, "created") }] };
  } catch (error) {
    return handleError(error, "creating invoice");
  }
});

server.tool("create_recurring_invoice", "Create a recurring invoice in sevdesk (auto-generates invoices at set intervals)", createRecurringInvoiceSchema, async (params) => {
  try {
    const invoice = await createRecurringInvoice(params);
    return { content: [{ type: "text", text: formatRecurringInvoiceResult(invoice) }] };
  } catch (error) {
    return handleError(error, "creating recurring invoice");
  }
});

server.tool("update_invoice", "Update an existing invoice in sevdesk", updateInvoiceSchema, async (params) => {
  try {
    const invoice = await updateInvoice(params);
    return { content: [{ type: "text", text: formatInvoiceResult(invoice, "updated") }] };
  } catch (error) {
    return handleError(error, "updating invoice");
  }
});

server.tool("delete_invoice", "Delete an invoice from sevdesk", deleteInvoiceSchema, async (params) => {
  try {
    await deleteInvoice(params);
    return { content: [{ type: "text", text: formatInvoiceDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting invoice");
  }
});

server.tool("get_invoice_pdf", "Get invoice PDF as base64 from sevdesk", getInvoicePdfSchema, async (params) => {
  try {
    const content = await getInvoicePdf(params);
    return { content: [{ type: "text", text: formatPdfResult(content, params.id) }] };
  } catch (error) {
    return handleError(error, "getting invoice PDF");
  }
});

server.tool("send_invoice_email", "Send an invoice via email from sevdesk", sendInvoiceEmailSchema, async (params) => {
  try {
    await sendInvoiceEmail(params);
    return { content: [{ type: "text", text: formatEmailSentResult(params.id, params.email) }] };
  } catch (error) {
    return handleError(error, "sending invoice email");
  }
});

server.tool("reset_invoice_to_draft", "Reset an invoice to draft status (100) in sevdesk v2.0", resetInvoiceToDraftSchema, async (params) => {
  try {
    const invoice = await resetInvoiceToDraft(params);
    return { content: [{ type: "text", text: formatStatusChangeResult(invoice, "reset to draft") }] };
  } catch (error) {
    return handleError(error, "resetting invoice to draft");
  }
});

server.tool("reset_invoice_to_open", "Reset an invoice to open status (200) in sevdesk v2.0", resetInvoiceToOpenSchema, async (params) => {
  try {
    const invoice = await resetInvoiceToOpen(params);
    return { content: [{ type: "text", text: formatStatusChangeResult(invoice, "reset to open") }] };
  } catch (error) {
    return handleError(error, "resetting invoice to open");
  }
});

server.tool("mark_invoice_sent", "Mark invoice as sent in sevdesk v2.0 (transitions draft→open)", markInvoiceSentSchema, async (params) => {
  try {
    const invoice = await markInvoiceSent(params);
    return { content: [{ type: "text", text: formatStatusChangeResult(invoice, "marked as sent") }] };
  } catch (error) {
    return handleError(error, "marking invoice as sent");
  }
});

server.tool("enshrine_invoice", "Enshrine (finalize) an invoice in sevdesk — prevents further changes", enshrineInvoiceSchema, async (params) => {
  try {
    const invoice = await enshrineInvoice(params);
    return { content: [{ type: "text", text: formatInvoiceEnshrineResult(invoice) }] };
  } catch (error) {
    return handleError(error, "enshrining invoice");
  }
});

server.tool("book_invoice_payment", "Book a payment on an invoice in sevdesk", bookInvoicePaymentSchema, async (params) => {
  try {
    const invoice = await bookInvoicePayment(params);
    return { content: [{ type: "text", text: formatPaymentBookedResult(invoice, params.amount) }] };
  } catch (error) {
    return handleError(error, "booking invoice payment");
  }
});

server.tool("list_invoice_positions", "List positions/line items for an invoice", listInvoicePositionsSchema, async (params) => {
  try {
    const positions = await listInvoicePositions(params);
    return { content: [{ type: "text", text: formatInvoicePositionsList(positions) }] };
  } catch (error) {
    return handleError(error, "listing invoice positions");
  }
});

server.tool("get_invoice_position", "Get a specific invoice position by ID", getInvoicePositionSchema, async (params) => {
  try {
    const position = await getInvoicePosition(params);
    return { content: [{ type: "text", text: formatInvoicePosition(position) }] };
  } catch (error) {
    return handleError(error, "getting invoice position");
  }
});

server.tool("create_invoice_position", "Create a new position on an invoice", createInvoicePositionSchema, async (params) => {
  try {
    const position = await createInvoicePosition(params);
    return { content: [{ type: "text", text: formatPositionResult(position, "created") }] };
  } catch (error) {
    return handleError(error, "creating invoice position");
  }
});

server.tool("update_invoice_position", "Update an existing invoice position", updateInvoicePositionSchema, async (params) => {
  try {
    const position = await updateInvoicePosition(params);
    return { content: [{ type: "text", text: formatPositionResult(position, "updated") }] };
  } catch (error) {
    return handleError(error, "updating invoice position");
  }
});

server.tool("delete_invoice_position", "Delete an invoice position", deleteInvoicePositionSchema, async (params) => {
  try {
    await deleteInvoicePosition(params);
    return { content: [{ type: "text", text: formatPositionDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting invoice position");
  }
});

// ============================================================================
// Voucher Tools
// ============================================================================

server.tool("list_vouchers", "List expense vouchers/receipts from sevdesk", listVouchersSchema, async (params) => {
  try {
    const vouchers = await listVouchers(params);
    return { content: [{ type: "text", text: formatVouchersList(vouchers) }] };
  } catch (error) {
    return handleError(error, "listing vouchers");
  }
});

server.tool("get_voucher", "Get a specific voucher/receipt by ID from sevdesk", getVoucherSchema, async (params) => {
  try {
    const voucher = await getVoucher(params);
    return { content: [{ type: "text", text: formatVoucher(voucher) }] };
  } catch (error) {
    return handleError(error, "getting voucher");
  }
});

server.tool("upload_voucher_file", "Upload a file (PDF, image) to attach to a voucher", uploadVoucherFileSchema, async (params) => {
  try {
    const result = await uploadVoucherFile(params);
    return { content: [{ type: "text", text: formatUploadResult(result) }] };
  } catch (error) {
    return handleError(error, "uploading voucher file");
  }
});

server.tool("create_voucher", "Create a new expense voucher in sevdesk", createVoucherSchema, async (params) => {
  try {
    const voucher = await createVoucher(params);
    return { content: [{ type: "text", text: formatVoucherResult(voucher, "created") }] };
  } catch (error) {
    return handleError(error, "creating voucher");
  }
});

server.tool("update_voucher", "Update an existing voucher in sevdesk", updateVoucherSchema, async (params) => {
  try {
    const voucher = await updateVoucher(params);
    return { content: [{ type: "text", text: formatVoucherResult(voucher, "updated") }] };
  } catch (error) {
    return handleError(error, "updating voucher");
  }
});

server.tool("delete_voucher", "Delete a voucher from sevdesk", deleteVoucherSchema, async (params) => {
  try {
    await deleteVoucher(params);
    return { content: [{ type: "text", text: formatVoucherDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting voucher");
  }
});

server.tool("book_voucher_payment", "Book a payment on a voucher in sevdesk", bookVoucherPaymentSchema, async (params) => {
  try {
    const voucher = await bookVoucherPayment(params);
    return { content: [{ type: "text", text: formatVoucherPaymentResult(voucher, params.amount) }] };
  } catch (error) {
    return handleError(error, "booking voucher payment");
  }
});

server.tool("enshrine_voucher", "Enshrine (finalize) a voucher in sevdesk", enshrineVoucherSchema, async (params) => {
  try {
    const voucher = await enshrineVoucher(params);
    return { content: [{ type: "text", text: formatEnshrineResult(voucher) }] };
  } catch (error) {
    return handleError(error, "enshrining voucher");
  }
});

server.tool("list_voucher_positions", "List positions for a voucher", listVoucherPositionsSchema, async (params) => {
  try {
    const positions = await listVoucherPositions(params);
    return { content: [{ type: "text", text: formatVoucherPositionsList(positions) }] };
  } catch (error) {
    return handleError(error, "listing voucher positions");
  }
});

server.tool("get_voucher_position", "Get a specific voucher position by ID", getVoucherPositionSchema, async (params) => {
  try {
    const position = await getVoucherPosition(params);
    return { content: [{ type: "text", text: formatVoucherPosition(position) }] };
  } catch (error) {
    return handleError(error, "getting voucher position");
  }
});

server.tool("create_voucher_position", "Create a new position on a voucher", createVoucherPositionSchema, async (params) => {
  try {
    const position = await createVoucherPosition(params);
    return { content: [{ type: "text", text: formatVoucherPositionResult(position, "created") }] };
  } catch (error) {
    return handleError(error, "creating voucher position");
  }
});

server.tool("update_voucher_position", "Update an existing voucher position", updateVoucherPositionSchema, async (params) => {
  try {
    const position = await updateVoucherPosition(params);
    return { content: [{ type: "text", text: formatVoucherPositionResult(position, "updated") }] };
  } catch (error) {
    return handleError(error, "updating voucher position");
  }
});

server.tool("delete_voucher_position", "Delete a voucher position", deleteVoucherPositionSchema, async (params) => {
  try {
    await deleteVoucherPosition(params);
    return { content: [{ type: "text", text: formatVoucherPositionDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting voucher position");
  }
});

// ============================================================================
// Bank Account Tools
// ============================================================================

server.tool("list_check_accounts", "List bank accounts from sevdesk", listCheckAccountsSchema, async (params) => {
  try {
    const accounts = await listCheckAccounts(params);
    return { content: [{ type: "text", text: formatCheckAccountsList(accounts) }] };
  } catch (error) {
    return handleError(error, "listing bank accounts");
  }
});

server.tool("get_check_account", "Get a specific bank account by ID from sevdesk", getCheckAccountSchema, async (params) => {
  try {
    const account = await getCheckAccount(params);
    return { content: [{ type: "text", text: formatCheckAccount(account) }] };
  } catch (error) {
    return handleError(error, "getting bank account");
  }
});

server.tool("get_check_account_balance", "Get bank account balance at a specific date from sevdesk", getCheckAccountBalanceSchema, async (params) => {
  try {
    const balance = await getCheckAccountBalance(params);
    return { content: [{ type: "text", text: formatBalance(balance, params.id, params.date) }] };
  } catch (error) {
    return handleError(error, "getting account balance");
  }
});

server.tool("create_check_account", "Create a new bank account in sevdesk", createCheckAccountSchema, async (params) => {
  try {
    const account = await createCheckAccount(params);
    return { content: [{ type: "text", text: formatCheckAccountResult(account, "created") }] };
  } catch (error) {
    return handleError(error, "creating bank account");
  }
});

server.tool("update_check_account", "Update an existing bank account in sevdesk", updateCheckAccountSchema, async (params) => {
  try {
    const account = await updateCheckAccount(params);
    return { content: [{ type: "text", text: formatCheckAccountResult(account, "updated") }] };
  } catch (error) {
    return handleError(error, "updating bank account");
  }
});

server.tool("delete_check_account", "Delete a bank account from sevdesk", deleteCheckAccountSchema, async (params) => {
  try {
    await deleteCheckAccount(params);
    return { content: [{ type: "text", text: formatCheckAccountDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting bank account");
  }
});

// ============================================================================
// Transaction Tools
// ============================================================================

server.tool("list_transactions", "List bank account transactions from sevdesk", listTransactionsSchema, async (params) => {
  try {
    const transactions = await listTransactions(params);
    return { content: [{ type: "text", text: formatTransactionsList(transactions) }] };
  } catch (error) {
    return handleError(error, "listing transactions");
  }
});

server.tool("get_transaction", "Get a specific transaction by ID from sevdesk", getTransactionSchema, async (params) => {
  try {
    const transaction = await getTransaction(params);
    return { content: [{ type: "text", text: formatTransaction(transaction) }] };
  } catch (error) {
    return handleError(error, "getting transaction");
  }
});

server.tool("create_transaction", "Create a new bank transaction in sevdesk", createTransactionSchema, async (params) => {
  try {
    const transaction = await createTransaction(params);
    return { content: [{ type: "text", text: formatTransactionResult(transaction, "created") }] };
  } catch (error) {
    return handleError(error, "creating transaction");
  }
});

server.tool("update_transaction", "Update an existing transaction in sevdesk", updateTransactionSchema, async (params) => {
  try {
    const transaction = await updateTransaction(params);
    return { content: [{ type: "text", text: formatTransactionResult(transaction, "updated") }] };
  } catch (error) {
    return handleError(error, "updating transaction");
  }
});

server.tool("delete_transaction", "Delete a transaction from sevdesk", deleteTransactionSchema, async (params) => {
  try {
    await deleteTransaction(params);
    return { content: [{ type: "text", text: formatTransactionDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting transaction");
  }
});

// ============================================================================
// Order Tools
// ============================================================================

server.tool("list_orders", "List orders (offers, confirmations) from sevdesk", listOrdersSchema, async (params) => {
  try {
    const orders = await listOrders(params);
    return { content: [{ type: "text", text: formatOrdersList(orders) }] };
  } catch (error) {
    return handleError(error, "listing orders");
  }
});

server.tool("get_order", "Get a specific order by ID from sevdesk", getOrderSchema, async (params) => {
  try {
    const order = await getOrder(params);
    return { content: [{ type: "text", text: formatOrder(order) }] };
  } catch (error) {
    return handleError(error, "getting order");
  }
});

server.tool("create_order", "Create a new order in sevdesk", createOrderSchema, async (params) => {
  try {
    const order = await createOrder(params);
    return { content: [{ type: "text", text: formatOrderResult(order, "created") }] };
  } catch (error) {
    return handleError(error, "creating order");
  }
});

server.tool("update_order", "Update an existing order in sevdesk", updateOrderSchema, async (params) => {
  try {
    const order = await updateOrder(params);
    return { content: [{ type: "text", text: formatOrderResult(order, "updated") }] };
  } catch (error) {
    return handleError(error, "updating order");
  }
});

server.tool("delete_order", "Delete an order from sevdesk", deleteOrderSchema, async (params) => {
  try {
    await deleteOrder(params);
    return { content: [{ type: "text", text: formatOrderDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting order");
  }
});

server.tool("get_order_pdf", "Get order PDF as base64 from sevdesk", getOrderPdfSchema, async (params) => {
  try {
    const content = await getOrderPdf(params);
    return { content: [{ type: "text", text: formatOrderPdfResult(content, params.id) }] };
  } catch (error) {
    return handleError(error, "getting order PDF");
  }
});

server.tool("send_order_email", "Send an order via email from sevdesk", sendOrderEmailSchema, async (params) => {
  try {
    await sendOrderEmail(params);
    return { content: [{ type: "text", text: formatOrderEmailSentResult(params.id, params.email) }] };
  } catch (error) {
    return handleError(error, "sending order email");
  }
});

server.tool("change_order_status", "Change order status in sevdesk", changeOrderStatusSchema, async (params) => {
  try {
    const order = await changeOrderStatus(params);
    return { content: [{ type: "text", text: formatOrderStatusChangeResult(order) }] };
  } catch (error) {
    return handleError(error, "changing order status");
  }
});

server.tool("list_order_positions", "List positions for an order", listOrderPositionsSchema, async (params) => {
  try {
    const positions = await listOrderPositions(params);
    return { content: [{ type: "text", text: formatOrderPositionsList(positions) }] };
  } catch (error) {
    return handleError(error, "listing order positions");
  }
});

server.tool("get_order_position", "Get a specific order position by ID", getOrderPositionSchema, async (params) => {
  try {
    const position = await getOrderPosition(params);
    return { content: [{ type: "text", text: formatOrderPosition(position) }] };
  } catch (error) {
    return handleError(error, "getting order position");
  }
});

server.tool("create_order_position", "Create a new position on an order", createOrderPositionSchema, async (params) => {
  try {
    const position = await createOrderPosition(params);
    return { content: [{ type: "text", text: formatOrderPositionResult(position, "created") }] };
  } catch (error) {
    return handleError(error, "creating order position");
  }
});

server.tool("update_order_position", "Update an existing order position", updateOrderPositionSchema, async (params) => {
  try {
    const position = await updateOrderPosition(params);
    return { content: [{ type: "text", text: formatOrderPositionResult(position, "updated") }] };
  } catch (error) {
    return handleError(error, "updating order position");
  }
});

server.tool("delete_order_position", "Delete an order position", deleteOrderPositionSchema, async (params) => {
  try {
    await deleteOrderPosition(params);
    return { content: [{ type: "text", text: formatOrderPositionDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting order position");
  }
});

// ============================================================================
// Credit Note Tools
// ============================================================================

server.tool("list_credit_notes", "List credit notes from sevdesk", listCreditNotesSchema, async (params) => {
  try {
    const creditNotes = await listCreditNotes(params);
    return { content: [{ type: "text", text: formatCreditNotesList(creditNotes) }] };
  } catch (error) {
    return handleError(error, "listing credit notes");
  }
});

server.tool("get_credit_note", "Get a specific credit note by ID from sevdesk", getCreditNoteSchema, async (params) => {
  try {
    const creditNote = await getCreditNote(params);
    return { content: [{ type: "text", text: formatCreditNote(creditNote) }] };
  } catch (error) {
    return handleError(error, "getting credit note");
  }
});

server.tool("create_credit_note", "Create a new credit note in sevdesk", createCreditNoteSchema, async (params) => {
  try {
    const creditNote = await createCreditNote(params);
    return { content: [{ type: "text", text: formatCreditNoteResult(creditNote, "created") }] };
  } catch (error) {
    return handleError(error, "creating credit note");
  }
});

server.tool("update_credit_note", "Update an existing credit note in sevdesk", updateCreditNoteSchema, async (params) => {
  try {
    const creditNote = await updateCreditNote(params);
    return { content: [{ type: "text", text: formatCreditNoteResult(creditNote, "updated") }] };
  } catch (error) {
    return handleError(error, "updating credit note");
  }
});

server.tool("delete_credit_note", "Delete a credit note from sevdesk", deleteCreditNoteSchema, async (params) => {
  try {
    await deleteCreditNote(params);
    return { content: [{ type: "text", text: formatCreditNoteDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting credit note");
  }
});

server.tool("get_credit_note_pdf", "Get credit note PDF as base64 from sevdesk", getCreditNotePdfSchema, async (params) => {
  try {
    const content = await getCreditNotePdf(params);
    return { content: [{ type: "text", text: formatCreditNotePdfResult(content, params.id) }] };
  } catch (error) {
    return handleError(error, "getting credit note PDF");
  }
});

server.tool("reset_credit_note_to_draft", "Reset a credit note to draft status (100) in sevdesk v2.0", resetCreditNoteToDraftSchema, async (params) => {
  try {
    const cn = await resetCreditNoteToDraft(params);
    return { content: [{ type: "text", text: formatCreditNoteStatusChangeResult(cn, "reset to draft") }] };
  } catch (error) {
    return handleError(error, "resetting credit note to draft");
  }
});

server.tool("reset_credit_note_to_open", "Reset a credit note to open status (200) in sevdesk v2.0", resetCreditNoteToOpenSchema, async (params) => {
  try {
    const cn = await resetCreditNoteToOpen(params);
    return { content: [{ type: "text", text: formatCreditNoteStatusChangeResult(cn, "reset to open") }] };
  } catch (error) {
    return handleError(error, "resetting credit note to open");
  }
});

server.tool("send_credit_note_email", "Send a credit note via email from sevdesk", sendCreditNoteEmailSchema, async (params) => {
  try {
    await sendCreditNoteEmail(params);
    return { content: [{ type: "text", text: formatCreditNoteEmailSentResult(params.id, params.email) }] };
  } catch (error) {
    return handleError(error, "sending credit note email");
  }
});

server.tool("list_credit_note_positions", "List positions for a credit note", listCreditNotePositionsSchema, async (params) => {
  try {
    const positions = await listCreditNotePositions(params);
    return { content: [{ type: "text", text: formatCreditNotePositionsList(positions) }] };
  } catch (error) {
    return handleError(error, "listing credit note positions");
  }
});

server.tool("get_credit_note_position", "Get a specific credit note position by ID", getCreditNotePositionSchema, async (params) => {
  try {
    const position = await getCreditNotePosition(params);
    return { content: [{ type: "text", text: formatCreditNotePosition(position) }] };
  } catch (error) {
    return handleError(error, "getting credit note position");
  }
});

server.tool("create_credit_note_position", "Create a new position on a credit note", createCreditNotePositionSchema, async (params) => {
  try {
    const position = await createCreditNotePosition(params);
    return { content: [{ type: "text", text: formatCreditNotePositionResult(position, "created") }] };
  } catch (error) {
    return handleError(error, "creating credit note position");
  }
});

server.tool("update_credit_note_position", "Update an existing credit note position", updateCreditNotePositionSchema, async (params) => {
  try {
    const position = await updateCreditNotePosition(params);
    return { content: [{ type: "text", text: formatCreditNotePositionResult(position, "updated") }] };
  } catch (error) {
    return handleError(error, "updating credit note position");
  }
});

server.tool("delete_credit_note_position", "Delete a credit note position", deleteCreditNotePositionSchema, async (params) => {
  try {
    await deleteCreditNotePosition(params);
    return { content: [{ type: "text", text: formatCreditNotePositionDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting credit note position");
  }
});

// ============================================================================
// Export / DATEV Tools
// ============================================================================

server.tool("export_datev", "Export booking data in DATEV format from sevdesk (CSV). Scope: E=Earnings, X=Expenditure, T=Transactions, C=Cashregister, D=Assets", exportDatevSchema, async (params) => {
  try {
    const data = await exportDatev(params);
    return { content: [{ type: "text", text: formatDatevExportResult(data) }] };
  } catch (error) {
    return handleError(error, "exporting DATEV data");
  }
});

server.tool("export_invoice_csv", "Export invoices as CSV from sevdesk", exportInvoiceCsvSchema, async (params) => {
  try {
    const data = await exportInvoiceCsv(params);
    return { content: [{ type: "text", text: formatCsvExportResult(data, "Invoice") }] };
  } catch (error) {
    return handleError(error, "exporting invoice CSV");
  }
});

server.tool("export_voucher_csv", "Export vouchers/receipts list as CSV from sevdesk", exportVoucherListCsvSchema, async (params) => {
  try {
    const data = await exportVoucherListCsv(params);
    return { content: [{ type: "text", text: formatCsvExportResult(data, "Voucher") }] };
  } catch (error) {
    return handleError(error, "exporting voucher CSV");
  }
});

server.tool("export_transactions_csv", "Export bank transactions as CSV from sevdesk", exportTransactionsCsvSchema, async (params) => {
  try {
    const data = await exportTransactionsCsv(params);
    return { content: [{ type: "text", text: formatCsvExportResult(data, "Transaction") }] };
  } catch (error) {
    return handleError(error, "exporting transactions CSV");
  }
});

// ============================================================================
// Part Tools
// ============================================================================

server.tool("list_parts", "List parts (products/services) from sevdesk", listPartsSchema, async (params) => {
  try {
    const parts = await listParts(params);
    return { content: [{ type: "text", text: formatPartsList(parts) }] };
  } catch (error) {
    return handleError(error, "listing parts");
  }
});

server.tool("get_part", "Get a specific part by ID from sevdesk", getPartSchema, async (params) => {
  try {
    const part = await getPart(params);
    return { content: [{ type: "text", text: formatPart(part) }] };
  } catch (error) {
    return handleError(error, "getting part");
  }
});

server.tool("create_part", "Create a new part (product/service) in sevdesk", createPartSchema, async (params) => {
  try {
    const part = await createPart(params);
    return { content: [{ type: "text", text: formatPartResult(part, "created") }] };
  } catch (error) {
    return handleError(error, "creating part");
  }
});

server.tool("update_part", "Update an existing part in sevdesk", updatePartSchema, async (params) => {
  try {
    const part = await updatePart(params);
    return { content: [{ type: "text", text: formatPartResult(part, "updated") }] };
  } catch (error) {
    return handleError(error, "updating part");
  }
});

server.tool("delete_part", "Delete a part from sevdesk", deletePartSchema, async (params) => {
  try {
    await deletePart(params);
    return { content: [{ type: "text", text: formatPartDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting part");
  }
});

server.tool("get_part_stock", "Get current stock level for a part", getPartStockSchema, async (params) => {
  try {
    const stock = await getPartStock(params);
    return { content: [{ type: "text", text: formatStockResult(stock, params.id) }] };
  } catch (error) {
    return handleError(error, "getting part stock");
  }
});

// ============================================================================
// Tag Tools
// ============================================================================

server.tool("list_tags", "List tags from sevdesk", listTagsSchema, async (params) => {
  try {
    const tags = await listTags(params);
    return { content: [{ type: "text", text: formatTagsList(tags) }] };
  } catch (error) {
    return handleError(error, "listing tags");
  }
});

server.tool("get_tag", "Get a specific tag by ID from sevdesk", getTagSchema, async (params) => {
  try {
    const tag = await getTag(params);
    return { content: [{ type: "text", text: formatTag(tag) }] };
  } catch (error) {
    return handleError(error, "getting tag");
  }
});

server.tool("create_tag", "Create a new tag in sevdesk", createTagSchema, async (params) => {
  try {
    const tag = await createTag(params);
    return { content: [{ type: "text", text: formatTagResult(tag, "created") }] };
  } catch (error) {
    return handleError(error, "creating tag");
  }
});

server.tool("update_tag", "Update an existing tag in sevdesk", updateTagSchema, async (params) => {
  try {
    const tag = await updateTag(params);
    return { content: [{ type: "text", text: formatTagResult(tag, "updated") }] };
  } catch (error) {
    return handleError(error, "updating tag");
  }
});

server.tool("delete_tag", "Delete a tag from sevdesk", deleteTagSchema, async (params) => {
  try {
    await deleteTag(params);
    return { content: [{ type: "text", text: formatTagDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting tag");
  }
});

server.tool("list_tag_relations", "List tag relations (objects linked to tags)", listTagRelationsSchema, async (params) => {
  try {
    const relations = await listTagRelations(params);
    return { content: [{ type: "text", text: formatTagRelationsList(relations) }] };
  } catch (error) {
    return handleError(error, "listing tag relations");
  }
});

server.tool("add_tag_to_object", "Add a tag to an object (contact, invoice, etc.)", addTagToObjectSchema, async (params) => {
  try {
    const relation = await addTagToObject(params);
    return { content: [{ type: "text", text: formatTagRelationResult(relation, "created") }] };
  } catch (error) {
    return handleError(error, "adding tag to object");
  }
});

server.tool("remove_tag_from_object", "Remove a tag from an object", removeTagFromObjectSchema, async (params) => {
  try {
    await removeTagFromObject(params);
    return { content: [{ type: "text", text: formatTagRelationDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "removing tag from object");
  }
});

// ============================================================================
// Contact Address Tools
// ============================================================================

server.tool("list_contact_addresses", "List addresses for contacts", listContactAddressesSchema, async (params) => {
  try {
    const addresses = await listContactAddresses(params);
    return { content: [{ type: "text", text: formatContactAddressesList(addresses) }] };
  } catch (error) {
    return handleError(error, "listing contact addresses");
  }
});

server.tool("get_contact_address", "Get a specific contact address by ID", getContactAddressSchema, async (params) => {
  try {
    const address = await getContactAddress(params);
    return { content: [{ type: "text", text: formatContactAddress(address) }] };
  } catch (error) {
    return handleError(error, "getting contact address");
  }
});

server.tool("create_contact_address", "Create a new address for a contact", createContactAddressSchema, async (params) => {
  try {
    const address = await createContactAddress(params);
    return { content: [{ type: "text", text: formatContactAddressResult(address, "created") }] };
  } catch (error) {
    return handleError(error, "creating contact address");
  }
});

server.tool("update_contact_address", "Update an existing contact address", updateContactAddressSchema, async (params) => {
  try {
    const address = await updateContactAddress(params);
    return { content: [{ type: "text", text: formatContactAddressResult(address, "updated") }] };
  } catch (error) {
    return handleError(error, "updating contact address");
  }
});

server.tool("delete_contact_address", "Delete a contact address", deleteContactAddressSchema, async (params) => {
  try {
    await deleteContactAddress(params);
    return { content: [{ type: "text", text: formatContactAddressDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting contact address");
  }
});

// ============================================================================
// Communication Way Tools
// ============================================================================

server.tool("list_communication_ways", "List communication ways (email, phone, etc.) for contacts", listCommunicationWaysSchema, async (params) => {
  try {
    const ways = await listCommunicationWays(params);
    return { content: [{ type: "text", text: formatCommunicationWaysList(ways) }] };
  } catch (error) {
    return handleError(error, "listing communication ways");
  }
});

server.tool("get_communication_way", "Get a specific communication way by ID", getCommunicationWaySchema, async (params) => {
  try {
    const way = await getCommunicationWay(params);
    return { content: [{ type: "text", text: formatCommunicationWay(way) }] };
  } catch (error) {
    return handleError(error, "getting communication way");
  }
});

server.tool("create_communication_way", "Create a new communication way for a contact", createCommunicationWaySchema, async (params) => {
  try {
    const way = await createCommunicationWay(params);
    return { content: [{ type: "text", text: formatCommunicationWayResult(way, "created") }] };
  } catch (error) {
    return handleError(error, "creating communication way");
  }
});

server.tool("update_communication_way", "Update an existing communication way", updateCommunicationWaySchema, async (params) => {
  try {
    const way = await updateCommunicationWay(params);
    return { content: [{ type: "text", text: formatCommunicationWayResult(way, "updated") }] };
  } catch (error) {
    return handleError(error, "updating communication way");
  }
});

server.tool("delete_communication_way", "Delete a communication way", deleteCommunicationWaySchema, async (params) => {
  try {
    await deleteCommunicationWay(params);
    return { content: [{ type: "text", text: formatCommunicationWayDeleteResult(params.id) }] };
  } catch (error) {
    return handleError(error, "deleting communication way");
  }
});

// ============================================================================
// Server Startup
// ============================================================================

async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  console.error("Starting sevdesk-mcp server v2.0.0...");
  console.error("Registered 77 tools across 10 resource categories");

  await server.connect(transport);

  console.error("sevdesk-mcp server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
