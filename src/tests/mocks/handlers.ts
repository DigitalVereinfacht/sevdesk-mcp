import { http, HttpResponse } from 'msw'
import {
  makeContact, makeInvoice, makeInvoicePos, makeVoucher, makeVoucherPos,
  makeCheckAccount, makeTransaction, makeOrder, makeOrderPos,
  makeCreditNote, makeCreditNotePos, makePart, makeTag, makeTagRelation,
  makeContactAddress, makeCommunicationWay,
} from './fixtures.js'

const BASE = 'https://my.sevdesk.de/api/v1'

export const handlers = [
  // ── SevUser ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/SevUser`, () =>
    HttpResponse.json({ objects: [{ id: '42' }] })
  ),

  // ── Contacts ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/Contact`, () =>
    HttpResponse.json({ objects: [makeContact()] })
  ),
  http.get(`${BASE}/Contact/:id`, () =>
    HttpResponse.json({ objects: makeContact() })
  ),
  http.post(`${BASE}/Contact`, () =>
    HttpResponse.json({ objects: makeContact() })
  ),
  http.put(`${BASE}/Contact/:id`, () =>
    HttpResponse.json({ objects: makeContact() })
  ),
  http.delete(`${BASE}/Contact/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),
  http.get(`${BASE}/Contact/Factory/getNextCustomerNumber`, () =>
    HttpResponse.json({ objects: 'K-10002' })
  ),

  // ── Invoices ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/Invoice`, () =>
    HttpResponse.json({ objects: [makeInvoice()] })
  ),
  http.get(`${BASE}/Invoice/:id`, () =>
    HttpResponse.json({ objects: makeInvoice() })
  ),
  http.post(`${BASE}/Invoice/Factory/saveInvoice`, () =>
    HttpResponse.json({ objects: { invoice: makeInvoice() } })
  ),
  http.put(`${BASE}/Invoice/:id`, () =>
    HttpResponse.json({ objects: makeInvoice() })
  ),
  http.delete(`${BASE}/Invoice/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),
  http.get(`${BASE}/Invoice/:id/getPdf`, () =>
    HttpResponse.json({ objects: { content: 'base64pdfcontent' } })
  ),
  http.post(`${BASE}/Invoice/:id/sendViaEmail`, () =>
    HttpResponse.json({ objects: {} })
  ),
  http.put(`${BASE}/Invoice/:id/resetToDraft`, () =>
    HttpResponse.json({ objects: makeInvoice({ status: '100' }) })
  ),
  http.put(`${BASE}/Invoice/:id/resetToOpen`, () =>
    HttpResponse.json({ objects: makeInvoice({ status: '200' }) })
  ),
  http.put(`${BASE}/Invoice/:id/sendBy`, () =>
    HttpResponse.json({ objects: makeInvoice({ status: '200' }) })
  ),
  http.put(`${BASE}/Invoice/:id/enshrine`, () =>
    HttpResponse.json({ objects: makeInvoice({ enshrined: '2024-01-15' }) })
  ),
  http.put(`${BASE}/Invoice/:id/bookAmount`, () =>
    HttpResponse.json({ objects: makeInvoice({ paidAmount: 119 }) })
  ),

  // ── Invoice Positions ────────────────────────────────────────────────────────
  http.get(`${BASE}/InvoicePos`, () =>
    HttpResponse.json({ objects: [makeInvoicePos()] })
  ),
  http.get(`${BASE}/InvoicePos/:id`, () =>
    HttpResponse.json({ objects: makeInvoicePos() })
  ),
  http.post(`${BASE}/InvoicePos`, () =>
    HttpResponse.json({ objects: makeInvoicePos() })
  ),
  http.put(`${BASE}/InvoicePos/:id`, () =>
    HttpResponse.json({ objects: makeInvoicePos() })
  ),
  http.delete(`${BASE}/InvoicePos/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Vouchers ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/Voucher`, () =>
    HttpResponse.json({ objects: [makeVoucher()] })
  ),
  http.get(`${BASE}/Voucher/:id`, () =>
    HttpResponse.json({ objects: makeVoucher() })
  ),
  http.post(`${BASE}/Voucher/Factory/saveVoucher`, () =>
    HttpResponse.json({ objects: { voucher: makeVoucher() } })
  ),
  http.post(`${BASE}/Voucher/Factory/uploadTempFile`, () =>
    HttpResponse.json({ objects: { filename: 'receipt.pdf', pages: 1, mimeType: 'application/pdf' } })
  ),
  http.put(`${BASE}/Voucher/:id`, () =>
    HttpResponse.json({ objects: makeVoucher() })
  ),
  http.delete(`${BASE}/Voucher/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),
  http.put(`${BASE}/Voucher/:id/bookAmount`, () =>
    HttpResponse.json({ objects: makeVoucher({ paidAmount: 119 }) })
  ),
  http.put(`${BASE}/Voucher/:id/enshrine`, () =>
    HttpResponse.json({ objects: makeVoucher({ enshrined: '2024-01-15' }) })
  ),

  // ── Voucher Positions ────────────────────────────────────────────────────────
  http.get(`${BASE}/VoucherPos`, () =>
    HttpResponse.json({ objects: [makeVoucherPos()] })
  ),
  http.get(`${BASE}/VoucherPos/:id`, () =>
    HttpResponse.json({ objects: makeVoucherPos() })
  ),
  http.post(`${BASE}/VoucherPos`, () =>
    HttpResponse.json({ objects: makeVoucherPos() })
  ),
  http.put(`${BASE}/VoucherPos/:id`, () =>
    HttpResponse.json({ objects: makeVoucherPos() })
  ),
  http.delete(`${BASE}/VoucherPos/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Orders ───────────────────────────────────────────────────────────────────
  http.get(`${BASE}/Order`, () =>
    HttpResponse.json({ objects: [makeOrder()] })
  ),
  http.get(`${BASE}/Order/:id`, () =>
    HttpResponse.json({ objects: makeOrder() })
  ),
  http.post(`${BASE}/Order/Factory/saveOrder`, () =>
    HttpResponse.json({ objects: { order: makeOrder() } })
  ),
  http.put(`${BASE}/Order/:id`, () =>
    HttpResponse.json({ objects: makeOrder() })
  ),
  http.delete(`${BASE}/Order/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),
  http.get(`${BASE}/Order/:id/getPdf`, () =>
    HttpResponse.json({ objects: { content: 'base64pdfcontent' } })
  ),
  http.post(`${BASE}/Order/:id/sendViaEmail`, () =>
    HttpResponse.json({ objects: {} })
  ),
  http.put(`${BASE}/Order/:id/changeStatus`, () =>
    HttpResponse.json({ objects: makeOrder({ status: '200' }) })
  ),

  // ── Order Positions ──────────────────────────────────────────────────────────
  http.get(`${BASE}/OrderPos`, () =>
    HttpResponse.json({ objects: [makeOrderPos()] })
  ),
  http.get(`${BASE}/OrderPos/:id`, () =>
    HttpResponse.json({ objects: makeOrderPos() })
  ),
  http.post(`${BASE}/OrderPos`, () =>
    HttpResponse.json({ objects: makeOrderPos() })
  ),
  http.put(`${BASE}/OrderPos/:id`, () =>
    HttpResponse.json({ objects: makeOrderPos() })
  ),
  http.delete(`${BASE}/OrderPos/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Check Accounts ───────────────────────────────────────────────────────────
  http.get(`${BASE}/CheckAccount`, () =>
    HttpResponse.json({ objects: [makeCheckAccount()] })
  ),
  http.get(`${BASE}/CheckAccount/:id`, () =>
    HttpResponse.json({ objects: makeCheckAccount() })
  ),
  http.get(`${BASE}/CheckAccount/:id/getBalanceAtDate`, () =>
    HttpResponse.json({ objects: '1500.00' })
  ),
  http.post(`${BASE}/CheckAccount`, () =>
    HttpResponse.json({ objects: makeCheckAccount() })
  ),
  http.put(`${BASE}/CheckAccount/:id`, () =>
    HttpResponse.json({ objects: makeCheckAccount() })
  ),
  http.delete(`${BASE}/CheckAccount/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Transactions ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/CheckAccountTransaction`, () =>
    HttpResponse.json({ objects: [makeTransaction()] })
  ),
  http.get(`${BASE}/CheckAccountTransaction/:id`, () =>
    HttpResponse.json({ objects: makeTransaction() })
  ),
  http.post(`${BASE}/CheckAccountTransaction`, () =>
    HttpResponse.json({ objects: makeTransaction() })
  ),
  http.put(`${BASE}/CheckAccountTransaction/:id`, () =>
    HttpResponse.json({ objects: makeTransaction() })
  ),
  http.delete(`${BASE}/CheckAccountTransaction/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Credit Notes ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/CreditNote`, () =>
    HttpResponse.json({ objects: [makeCreditNote()] })
  ),
  http.get(`${BASE}/CreditNote/:id`, () =>
    HttpResponse.json({ objects: makeCreditNote() })
  ),
  http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, () =>
    HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
  ),
  http.put(`${BASE}/CreditNote/:id`, () =>
    HttpResponse.json({ objects: makeCreditNote() })
  ),
  http.delete(`${BASE}/CreditNote/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),
  http.get(`${BASE}/CreditNote/:id/getPdf`, () =>
    HttpResponse.json({ objects: { content: 'base64pdfcontent' } })
  ),
  http.post(`${BASE}/CreditNote/:id/sendViaEmail`, () =>
    HttpResponse.json({ objects: {} })
  ),
  http.put(`${BASE}/CreditNote/:id/resetToDraft`, () =>
    HttpResponse.json({ objects: makeCreditNote({ status: '100' }) })
  ),
  http.put(`${BASE}/CreditNote/:id/resetToOpen`, () =>
    HttpResponse.json({ objects: makeCreditNote({ status: '200' }) })
  ),

  // ── Credit Note Positions ────────────────────────────────────────────────────
  http.get(`${BASE}/CreditNotePos`, () =>
    HttpResponse.json({ objects: [makeCreditNotePos()] })
  ),
  http.get(`${BASE}/CreditNotePos/:id`, () =>
    HttpResponse.json({ objects: makeCreditNotePos() })
  ),
  http.post(`${BASE}/CreditNotePos`, () =>
    HttpResponse.json({ objects: makeCreditNotePos() })
  ),
  http.put(`${BASE}/CreditNotePos/:id`, () =>
    HttpResponse.json({ objects: makeCreditNotePos() })
  ),
  http.delete(`${BASE}/CreditNotePos/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Parts ────────────────────────────────────────────────────────────────────
  http.get(`${BASE}/Part`, () =>
    HttpResponse.json({ objects: [makePart()] })
  ),
  http.get(`${BASE}/Part/:id`, () =>
    HttpResponse.json({ objects: makePart() })
  ),
  http.get(`${BASE}/Part/:id/getStock`, () =>
    HttpResponse.json({ objects: 10 })
  ),
  http.post(`${BASE}/Part`, () =>
    HttpResponse.json({ objects: makePart() })
  ),
  http.put(`${BASE}/Part/:id`, () =>
    HttpResponse.json({ objects: makePart() })
  ),
  http.delete(`${BASE}/Part/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Tags ─────────────────────────────────────────────────────────────────────
  http.get(`${BASE}/Tag`, () =>
    HttpResponse.json({ objects: [makeTag()] })
  ),
  http.get(`${BASE}/Tag/:id`, () =>
    HttpResponse.json({ objects: makeTag() })
  ),
  http.post(`${BASE}/Tag`, () =>
    HttpResponse.json({ objects: makeTag() })
  ),
  http.put(`${BASE}/Tag/:id`, () =>
    HttpResponse.json({ objects: makeTag() })
  ),
  http.delete(`${BASE}/Tag/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Tag Relations ────────────────────────────────────────────────────────────
  http.get(`${BASE}/TagRelation`, () =>
    HttpResponse.json({ objects: [makeTagRelation()] })
  ),
  http.post(`${BASE}/TagRelation`, () =>
    HttpResponse.json({ objects: makeTagRelation() })
  ),
  http.delete(`${BASE}/TagRelation/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Contact Addresses ────────────────────────────────────────────────────────
  http.get(`${BASE}/ContactAddress`, () =>
    HttpResponse.json({ objects: [makeContactAddress()] })
  ),
  http.get(`${BASE}/ContactAddress/:id`, () =>
    HttpResponse.json({ objects: makeContactAddress() })
  ),
  http.post(`${BASE}/ContactAddress`, () =>
    HttpResponse.json({ objects: makeContactAddress() })
  ),
  http.put(`${BASE}/ContactAddress/:id`, () =>
    HttpResponse.json({ objects: makeContactAddress() })
  ),
  http.delete(`${BASE}/ContactAddress/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Communication Ways ───────────────────────────────────────────────────────
  http.get(`${BASE}/CommunicationWay`, () =>
    HttpResponse.json({ objects: [makeCommunicationWay()] })
  ),
  http.get(`${BASE}/CommunicationWay/:id`, () =>
    HttpResponse.json({ objects: makeCommunicationWay() })
  ),
  http.post(`${BASE}/CommunicationWay`, () =>
    HttpResponse.json({ objects: makeCommunicationWay() })
  ),
  http.put(`${BASE}/CommunicationWay/:id`, () =>
    HttpResponse.json({ objects: makeCommunicationWay() })
  ),
  http.delete(`${BASE}/CommunicationWay/:id`, () =>
    new HttpResponse(null, { status: 200 })
  ),

  // ── Exports ──────────────────────────────────────────────────────────────────
  http.get(`${BASE}/Export/datevCSV`, () =>
    HttpResponse.json({ objects: { filename: 'datev.zip', content: 'base64content' } })
  ),
  http.get(`${BASE}/Export/invoiceCsv`, () =>
    HttpResponse.json({ objects: { filename: 'invoices.csv', content: 'base64content' } })
  ),
  http.get(`${BASE}/Export/voucherListCsv`, () =>
    HttpResponse.json({ objects: { filename: 'vouchers.csv', content: 'base64content' } })
  ),
  http.get(`${BASE}/Export/transactionsCsv`, () =>
    HttpResponse.json({ objects: { filename: 'transactions.csv', content: 'base64content' } })
  ),
]
