/**
 * Sevdesk API Type Definitions
 * TypeScript interfaces for sevdesk API responses
 */

/**
 * Common sevdesk object reference
 */
export interface SevdeskObjectRef {
  id: string;
  objectName: string;
}

/**
 * Contact (Customer/Supplier/Partner)
 */
export interface Contact {
  id: string;
  objectName: "Contact";
  create: string;
  update: string;
  name: string;
  status: string;
  customerNumber: string | null;
  parent: SevdeskObjectRef | null;
  surename: string | null;
  familyname: string | null;
  titel: string | null;
  category: SevdeskObjectRef | null;
  description: string | null;
  academicTitle: string | null;
  gender: string | null;
  name2: string | null;
  birthday: string | null;
  vatNumber: string | null;
  bankAccount: string | null;
  bankNumber: string | null;
  defaultCashbackTime: number | null;
  defaultCashbackPercent: number | null;
  defaultTimeToPay: number | null;
  taxNumber: string | null;
  taxSet: SevdeskObjectRef | null;
  defaultDiscountAmount: number | null;
  defaultDiscountPercentage: boolean | null;
  buyerReference: string | null;
  governmentAgency: boolean | null;
}

/**
 * Invoice
 */
export interface Invoice {
  id: string;
  objectName: "Invoice";
  create: string;
  update: string;
  invoiceNumber: string;
  contact: SevdeskObjectRef;
  invoiceDate: string;
  header: string | null;
  headText: string | null;
  footText: string | null;
  timeToPay: number | null;
  discountTime: number | null;
  discount: number | null;
  addressName: string | null;
  addressStreet: string | null;
  addressZip: string | null;
  addressCity: string | null;
  addressCountry: SevdeskObjectRef | null;
  payDate: string | null;
  deliveryDate: string | null;
  status: string;
  smallSettlement: boolean;
  contactPerson: SevdeskObjectRef | null;
  taxRate: number | null;
  taxText: string | null;
  dunningLevel: number | null;
  addressParentName: string | null;
  taxType: string | null;
  sendDate: string | null;
  originLastInvoice: SevdeskObjectRef | null;
  invoiceType: string;
  accountIntervall: number | null;
  accountLastInvoice: string | null;
  accountNextInvoice: string | null;
  reminderTotal: number | null;
  reminderDebit: number | null;
  reminderDeadline: string | null;
  reminderCharge: number | null;
  currency: string;
  sumNet: string;
  sumTax: string;
  sumGross: string;
  sumDiscounts: string;
  sumNetForeignCurrency: string;
  sumTaxForeignCurrency: string;
  sumGrossForeignCurrency: string;
  sumDiscountsForeignCurrency: string;
  sumNetAccounting: string;
  sumTaxAccounting: string;
  sumGrossAccounting: string;
  paidAmount: number | null;
  customerInternalNote: string | null;
  showNet: boolean;
  enshrined: string | null;
  sendType: string | null;
  deliveryDateUntil: string | null;
  sendPaymentReceivedNotificationDate: string | null;
}

/**
 * Voucher (Expense/Receipt)
 */
export interface Voucher {
  id: string;
  objectName: "Voucher";
  create: string;
  update: string;
  sevClient: SevdeskObjectRef;
  createUser: SevdeskObjectRef;
  voucherDate: string;
  supplier: SevdeskObjectRef | null;
  supplierName: string | null;
  description: string | null;
  payDate: string | null;
  status: string;
  sumNet: string;
  sumTax: string;
  sumGross: string;
  sumNetAccounting: string;
  sumTaxAccounting: string;
  sumGrossAccounting: string;
  sumDiscounts: string;
  sumDiscountsForeignCurrency: string;
  paidAmount: number | null;
  taxType: string;
  creditDebit: string;
  voucherType: string;
  currency: string;
  propertyForeignCurrencyDeadline: string | null;
  propertyExchangeRate: number | null;
  recurringInterval: string | null;
  recurringStartDate: string | null;
  recurringNextVoucher: string | null;
  recurringLastVoucher: string | null;
  recurringEndDate: string | null;
  enshrined: string | null;
  taxSet: SevdeskObjectRef | null;
  paymentDeadline: string | null;
  deliveryDate: string | null;
  deliveryDateUntil: string | null;
  document: SevdeskObjectRef | null;
  costCentre: SevdeskObjectRef | null;
}

/**
 * Check Account (Bank Account)
 */
export interface CheckAccount {
  id: string;
  objectName: "CheckAccount";
  create: string;
  update: string;
  sevClient: SevdeskObjectRef;
  name: string;
  type: string;
  importType: string | null;
  currency: string;
  defaultAccount: string;
  status: string;
  bankServer: string | null;
  autoMapTransactions: string | null;
}

/**
 * Check Account Balance Response
 */
export interface CheckAccountBalance {
  balance: number;
}

/**
 * Check Account Transaction
 */
export interface CheckAccountTransaction {
  id: string;
  objectName: "CheckAccountTransaction";
  create: string;
  update: string;
  sevClient: SevdeskObjectRef;
  valueDate: string;
  entryDate: string | null;
  paymtPurpose: string | null;
  amount: number;
  payeePayerName: string | null;
  checkAccount: SevdeskObjectRef;
  status: string;
  enshrined: string | null;
  sourceTransaction: SevdeskObjectRef | null;
  targetTransaction: SevdeskObjectRef | null;
}

/**
 * Contact Address
 */
export interface ContactAddress {
  id: string;
  objectName: "ContactAddress";
  create: string;
  update: string;
  contact: SevdeskObjectRef;
  street: string | null;
  zip: string | null;
  city: string | null;
  country: SevdeskObjectRef;
  category: SevdeskObjectRef | null;
  name: string | null;
  name2: string | null;
  name3: string | null;
  name4: string | null;
}

/**
 * Communication Way (Email, Phone, etc.)
 */
export interface CommunicationWay {
  id: string;
  objectName: "CommunicationWay";
  create: string;
  update: string;
  contact: SevdeskObjectRef;
  type: string;
  value: string;
  key: SevdeskObjectRef;
  main: string;
}

/**
 * Order
 */
export interface Order {
  id: string;
  objectName: "Order";
  create: string;
  update: string;
  orderNumber: string;
  contact: SevdeskObjectRef;
  orderDate: string;
  header: string | null;
  headText: string | null;
  footText: string | null;
  addressName: string | null;
  addressStreet: string | null;
  addressZip: string | null;
  addressCity: string | null;
  addressCountry: SevdeskObjectRef | null;
  deliveryDate: string | null;
  status: string;
  smallSettlement: boolean;
  contactPerson: SevdeskObjectRef | null;
  taxRate: number | null;
  taxText: string | null;
  taxType: string | null;
  orderType: string;
  sendDate: string | null;
  currency: string;
  sumNet: string;
  sumTax: string;
  sumGross: string;
  sumDiscounts: string;
  sumNetForeignCurrency: string;
  sumTaxForeignCurrency: string;
  sumGrossForeignCurrency: string;
  sumDiscountsForeignCurrency: string;
  customerInternalNote: string | null;
  showNet: boolean;
  sendType: string | null;
  version: string;
}

/**
 * Credit Note
 */
export interface CreditNote {
  id: string;
  objectName: "CreditNote";
  create: string;
  update: string;
  creditNoteNumber: string;
  contact: SevdeskObjectRef;
  creditNoteDate: string;
  header: string | null;
  headText: string | null;
  footText: string | null;
  addressName: string | null;
  addressStreet: string | null;
  addressZip: string | null;
  addressCity: string | null;
  addressCountry: SevdeskObjectRef | null;
  status: string;
  smallSettlement: boolean;
  contactPerson: SevdeskObjectRef | null;
  taxRate: number | null;
  taxText: string | null;
  taxType: string | null;
  sendDate: string | null;
  currency: string;
  sumNet: string;
  sumTax: string;
  sumGross: string;
  sumDiscounts: string;
  customerInternalNote: string | null;
  showNet: boolean;
  sendType: string | null;
  bookingCategory: string | null;
}

/**
 * Part (Product/Service)
 */
export interface Part {
  id: string;
  objectName: "Part";
  create: string;
  update: string;
  name: string;
  partNumber: string;
  text: string | null;
  category: SevdeskObjectRef | null;
  stock: number;
  stockEnabled: boolean;
  unity: SevdeskObjectRef;
  price: number | null;
  priceNet: number | null;
  priceGross: number | null;
  sevClient: SevdeskObjectRef;
  pricePurchase: number | null;
  taxRate: number;
  status: string;
  internalComment: string | null;
}

/**
 * Tag
 */
export interface Tag {
  id: string;
  objectName: "Tag";
  create: string;
  update: string;
  name: string;
  sevClient: SevdeskObjectRef;
}

/**
 * Tag Relation (links tags to objects)
 */
export interface TagRelation {
  id: string;
  objectName: "TagRelation";
  tag: SevdeskObjectRef;
  object: SevdeskObjectRef;
}

/**
 * Invoice Position (line item)
 */
export interface InvoicePos {
  id: string;
  objectName: "InvoicePos";
  create: string;
  update: string;
  invoice: SevdeskObjectRef;
  part: SevdeskObjectRef | null;
  quantity: number;
  price: number;
  priceNet: number;
  priceTax: number;
  priceGross: number;
  name: string;
  unity: SevdeskObjectRef;
  sevClient: SevdeskObjectRef;
  positionNumber: number;
  text: string | null;
  discount: number | null;
  taxRate: number;
  sumNet: string;
  sumGross: string;
  sumTax: string;
  sumDiscount: string | null;
}

/**
 * Voucher Position (line item)
 */
export interface VoucherPos {
  id: string;
  objectName: "VoucherPos";
  create: string;
  update: string;
  voucher: SevdeskObjectRef;
  accountingType: SevdeskObjectRef;
  estimatedAccountingType: SevdeskObjectRef | null;
  taxRate: number;
  sum: number;
  net: boolean;
  isAsset: boolean;
  sumNet: number;
  sumTax: number;
  sumGross: number;
  comment: string | null;
}

/**
 * Order Position (line item)
 */
export interface OrderPos {
  id: string;
  objectName: "OrderPos";
  create: string;
  update: string;
  order: SevdeskObjectRef;
  part: SevdeskObjectRef | null;
  quantity: number;
  price: number;
  priceNet: number;
  priceTax: number;
  priceGross: number;
  name: string;
  unity: SevdeskObjectRef;
  sevClient: SevdeskObjectRef;
  positionNumber: number;
  text: string | null;
  discount: number | null;
  taxRate: number;
  sumNet: string;
  sumGross: string;
}

/**
 * Credit Note Position (line item)
 */
export interface CreditNotePos {
  id: string;
  objectName: "CreditNotePos";
  create: string;
  update: string;
  creditNote: SevdeskObjectRef;
  part: SevdeskObjectRef | null;
  quantity: number;
  price: number;
  priceNet: number;
  priceTax: number;
  priceGross: number;
  name: string;
  unity: SevdeskObjectRef;
  sevClient: SevdeskObjectRef;
  positionNumber: number;
  text: string | null;
  discount: number | null;
  taxRate: number;
  sumNet: string;
  sumGross: string;
}
