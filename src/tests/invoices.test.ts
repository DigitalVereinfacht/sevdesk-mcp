import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeInvoice, makeInvoicePos } from './mocks/fixtures.js'
import {
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
  formatInvoice,
  formatInvoicesList,
  formatInvoiceResult,
  formatInvoiceDeleteResult,
  formatPdfResult,
  formatEmailSentResult,
  formatStatusChangeResult,
  formatInvoiceEnshrineResult,
  formatPaymentBookedResult,
  formatRecurringInvoiceResult,
  formatInvoicePosition,
  formatInvoicePositionsList,
  formatPositionResult,
  formatPositionDeleteResult,
} from '../tools/invoices.js'

const BASE = 'https://my.sevdesk.de/api/v1'

const basePosition = {
  quantity: 1,
  price: 100,
  name: 'Test Service',
  taxRate: 19,
}

describe('listInvoices', () => {
  it('uses default limit=100 and depth=0', async () => {
    let url = ''
    server.use(
      http.get(`${BASE}/Invoice`, ({ request }) => {
        url = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listInvoices({})
    expect(url).toContain('limit=100')
    expect(url).toContain('depth=0')
  })

  it('filters by status', async () => {
    let url = ''
    server.use(
      http.get(`${BASE}/Invoice`, ({ request }) => {
        url = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listInvoices({ status: '200' })
    expect(url).toContain('status=200')
  })

  it('filters by invoiceNumber', async () => {
    let url = ''
    server.use(
      http.get(`${BASE}/Invoice`, ({ request }) => {
        url = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listInvoices({ invoiceNumber: 'RE-001' })
    expect(url).toContain('invoiceNumber=RE-001')
  })

  it('filters by date range', async () => {
    let url = ''
    server.use(
      http.get(`${BASE}/Invoice`, ({ request }) => {
        url = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listInvoices({ startDate: '2024-01-01', endDate: '2024-12-31' })
    expect(url).toContain('startDate=2024-01-01')
    expect(url).toContain('endDate=2024-12-31')
  })

  it('filters by contactId with bracketed params', async () => {
    let url = ''
    server.use(
      http.get(`${BASE}/Invoice`, ({ request }) => {
        url = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listInvoices({ contactId: '5' })
    expect(url).toContain('contact%5Bid%5D=5')
    expect(url).toContain('contact%5BobjectName%5D=Contact')
  })
})

describe('getInvoice', () => {
  it('returns a single invoice', async () => {
    server.use(
      http.get(`${BASE}/Invoice/10`, () =>
        HttpResponse.json({ objects: makeInvoice({ id: '10' }) })
      )
    )
    const result = await getInvoice({ id: '10' })
    expect(result.id).toBe('10')
  })
})

describe('createInvoice', () => {
  it('uses today as default date when not provided', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({ contactId: '1', positions: [basePosition] })
    expect((capturedBody.invoice as Record<string, unknown>).invoiceDate).toBe('2024-06-15')
    vi.useRealTimers()
  })

  it('uses provided date', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({
      contactId: '1',
      invoiceDate: '2024-03-01',
      positions: [basePosition],
    })
    expect((capturedBody.invoice as Record<string, unknown>).invoiceDate).toBe('2024-03-01')
  })

  it('forces taxType="default" when taxRule is provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({
      contactId: '1',
      positions: [basePosition],
      taxType: 'eu',
      taxRule: 1,
    })
    const inv = capturedBody.invoice as Record<string, unknown>
    expect(inv.taxType).toBe('default')
    expect(inv.taxRule).toEqual({ id: 1, objectName: 'TaxRule' })
  })

  it('uses provided taxType when no taxRule', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({
      contactId: '1',
      positions: [basePosition],
      taxType: 'eu',
    })
    expect((capturedBody.invoice as Record<string, unknown>).taxType).toBe('eu')
  })

  it('defaults taxType to "default" when no taxType or taxRule provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({ contactId: '1', positions: [basePosition] })
    expect((capturedBody.invoice as Record<string, unknown>).taxType).toBe('default')
  })

  it('maps positions with all optional fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({
      contactId: '1',
      positions: [{
        quantity: 2,
        price: 50,
        name: 'Item',
        taxRate: 7,
        unity: 9,
        text: 'Description',
        discount: 10,
        partId: 'P-1',
      }],
    })
    const positions = capturedBody.invoicePosSave as Array<Record<string, unknown>>
    expect(positions[0].text).toBe('Description')
    expect(positions[0].discount).toBe(10)
    expect(positions[0].part).toEqual({ id: 'P-1', objectName: 'Part' })
    expect((positions[0].unity as Record<string, unknown>).id).toBe(9)
  })

  it('sends all optional invoice fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({
      contactId: '1',
      positions: [basePosition],
      header: 'Test Header',
      headText: 'Head text',
      footText: 'Foot text',
      currency: 'USD',
      discount: 5,
      deliveryDate: '2024-02-01',
      deliveryDateUntil: '2024-02-28',
      timeToPay: 30,
      invoiceType: 'SR',
      showNet: false,
      sendType: 'VM',
    })
    const inv = capturedBody.invoice as Record<string, unknown>
    expect(inv.header).toBe('Test Header')
    expect(inv.currency).toBe('USD')
    expect(inv.invoiceType).toBe('SR')
    expect(inv.showNet).toBe(false)
  })

  it('defaults showNet to true', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createInvoice({ contactId: '1', positions: [basePosition] })
    expect((capturedBody.invoice as Record<string, unknown>).showNet).toBe(true)
  })
})

describe('createRecurringInvoice', () => {
  it('sets invoiceType to WKR and includes recurring fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice({ invoiceType: 'WKR' }) } })
      })
    )
    await createRecurringInvoice({
      contactId: '1',
      positions: [basePosition],
      accountIntervall: 1,
      accountNextInvoice: '2025-01-01',
    })
    const inv = capturedBody.invoice as Record<string, unknown>
    expect(inv.invoiceType).toBe('WKR')
    expect(inv.accountIntervall).toBe(1)
    expect(inv.accountNextInvoice).toBe('2025-01-01')
  })

  it('maps recurring invoice positions with optional text/discount/partId', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createRecurringInvoice({
      contactId: '1',
      accountIntervall: 1,
      accountNextInvoice: '2025-02-01',
      positions: [{ quantity: 1, price: 50, name: 'Service', taxRate: 19, text: 'Detail', discount: 5, partId: 'P-1' }],
    })
    const positions = capturedBody.invoicePosSave as Array<Record<string, unknown>>
    expect(positions[0].text).toBe('Detail')
    expect(positions[0].discount).toBe(5)
    expect(positions[0].part).toEqual({ id: 'P-1', objectName: 'Part' })
  })

  it('handles taxRule in recurring invoice', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { invoice: makeInvoice() } })
      })
    )
    await createRecurringInvoice({
      contactId: '1',
      positions: [basePosition],
      accountIntervall: 4,
      accountNextInvoice: '2025-01-01',
      taxRule: 1,
      header: 'Recurring',
      headText: 'Head',
      footText: 'Foot',
      timeToPay: 30,
      sendType: 'VPDF',
    })
    const inv = capturedBody.invoice as Record<string, unknown>
    expect(inv.taxType).toBe('default')
    expect(inv.taxRule).toEqual({ id: 1, objectName: 'TaxRule' })
    expect(inv.header).toBe('Recurring')
  })
})

describe('updateInvoice', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Invoice/10`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoice() })
      })
    )
    await updateInvoice({ id: '10', header: 'New Header' })
    expect(capturedBody.header).toBe('New Header')
    expect(capturedBody.headText).toBeUndefined()
  })

  it('updates without header (header false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Invoice/10`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoice() })
      })
    )
    await updateInvoice({ id: '10', headText: 'Only head text' })
    expect(capturedBody.header).toBeUndefined()
    expect(capturedBody.headText).toBe('Only head text')
  })

  it('sends all update fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Invoice/10`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoice() })
      })
    )
    await updateInvoice({
      id: '10',
      header: 'H',
      headText: 'HT',
      footText: 'FT',
      deliveryDate: '2024-02-01',
      deliveryDateUntil: '2024-02-28',
      timeToPay: 14,
      customerInternalNote: 'Note',
    })
    expect(capturedBody.footText).toBe('FT')
    expect(capturedBody.timeToPay).toBe(14)
    expect(capturedBody.customerInternalNote).toBe('Note')
  })
})

describe('deleteInvoice', () => {
  it('sends DELETE to /Invoice/:id', async () => {
    let deleted = false
    server.use(
      http.delete(`${BASE}/Invoice/10`, () => {
        deleted = true
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteInvoice({ id: '10' })
    expect(deleted).toBe(true)
  })
})

describe('getInvoicePdf', () => {
  it('returns base64 string from PDF endpoint', async () => {
    server.use(
      http.get(`${BASE}/Invoice/10/getPdf`, () =>
        HttpResponse.json({ objects: { content: 'pdfBase64' } })
      )
    )
    const result = await getInvoicePdf({ id: '10' })
    expect(result).toBe('pdfBase64')
  })

  it('appends download=true when requested', async () => {
    let url = ''
    server.use(
      http.get(`${BASE}/Invoice/10/getPdf`, ({ request }) => {
        url = request.url
        return HttpResponse.json({ objects: { content: 'pdfBase64' } })
      })
    )
    await getInvoicePdf({ id: '10', download: true })
    expect(url).toContain('download=true')
  })
})

describe('sendInvoiceEmail', () => {
  it('sends email with all required fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/10/sendViaEmail`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: {} })
      })
    )
    await sendInvoiceEmail({
      id: '10',
      email: 'test@example.com',
      subject: 'Invoice',
      text: 'Please find attached',
    })
    expect(capturedBody.toEmail).toBe('test@example.com')
    expect(capturedBody.copy).toBe(false)
    expect(capturedBody.additionalAttachments).toBeUndefined()
  })

  it('sends copy=true when requested', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Invoice/10/sendViaEmail`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: {} })
      })
    )
    await sendInvoiceEmail({
      id: '10',
      email: 'test@example.com',
      subject: 'Invoice',
      text: 'Body',
      copy: true,
      additionalAttachments: 'doc-1,doc-2',
    })
    expect(capturedBody.copy).toBe(true)
    expect(capturedBody.additionalAttachments).toBe('doc-1,doc-2')
  })
})

describe('resetInvoiceToDraft', () => {
  it('calls correct endpoint', async () => {
    let called = false
    server.use(
      http.put(`${BASE}/Invoice/10/resetToDraft`, () => {
        called = true
        return HttpResponse.json({ objects: makeInvoice({ status: '100' }) })
      })
    )
    const result = await resetInvoiceToDraft({ id: '10' })
    expect(called).toBe(true)
    expect(result.status).toBe('100')
  })
})

describe('resetInvoiceToOpen', () => {
  it('calls correct endpoint', async () => {
    let called = false
    server.use(
      http.put(`${BASE}/Invoice/10/resetToOpen`, () => {
        called = true
        return HttpResponse.json({ objects: makeInvoice({ status: '200' }) })
      })
    )
    const result = await resetInvoiceToOpen({ id: '10' })
    expect(called).toBe(true)
    expect(result.status).toBe('200')
  })
})

describe('markInvoiceSent', () => {
  it('defaults sendType to VPDF and sendDraft to false', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Invoice/10/sendBy`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoice({ status: '200' }) })
      })
    )
    await markInvoiceSent({ id: '10' })
    expect(capturedBody.sendType).toBe('VPDF')
    expect(capturedBody.sendDraft).toBe(false)
  })

  it('uses provided sendType and sendDraft', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Invoice/10/sendBy`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoice({ status: '200' }) })
      })
    )
    await markInvoiceSent({ id: '10', sendType: 'VM', sendDraft: true })
    expect(capturedBody.sendType).toBe('VM')
    expect(capturedBody.sendDraft).toBe(true)
  })
})

describe('enshrineInvoice', () => {
  it('calls enshrine endpoint', async () => {
    let called = false
    server.use(
      http.put(`${BASE}/Invoice/10/enshrine`, () => {
        called = true
        return HttpResponse.json({ objects: makeInvoice({ enshrined: '2024-01-15' }) })
      })
    )
    await enshrineInvoice({ id: '10' })
    expect(called).toBe(true)
  })
})

describe('bookInvoicePayment', () => {
  it('books payment with defaults (type N, today date)', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-05-20'))
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Invoice/10/bookAmount`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoice({ paidAmount: 100 }) })
      })
    )
    await bookInvoicePayment({ id: '10', amount: 100 })
    expect(capturedBody.amount).toBe(100)
    expect(capturedBody.type).toBe('N')
    expect(capturedBody.date).toBe('2024-05-20')
    expect(capturedBody.checkAccount).toBeUndefined()
    vi.useRealTimers()
  })

  it('includes checkAccountId and checkAccountTransactionId when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Invoice/10/bookAmount`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoice({ paidAmount: 119 }) })
      })
    )
    await bookInvoicePayment({
      id: '10',
      amount: 119,
      date: '2024-01-15',
      checkAccountId: 'CA-1',
      checkAccountTransactionId: 'CAT-1',
      type: 'CB',
    })
    expect(capturedBody.checkAccount).toEqual({ id: 'CA-1', objectName: 'CheckAccount' })
    expect(capturedBody.checkAccountTransaction).toEqual({ id: 'CAT-1', objectName: 'CheckAccountTransaction' })
    expect(capturedBody.type).toBe('CB')
  })
})

describe('Invoice positions', () => {
  it('listInvoicePositions sends correct bracketed params', async () => {
    let url = ''
    server.use(
      http.get(`${BASE}/InvoicePos`, ({ request }) => {
        url = request.url
        return HttpResponse.json({ objects: [makeInvoicePos()] })
      })
    )
    await listInvoicePositions({ invoiceId: '10' })
    expect(url).toContain('invoice%5Bid%5D=10')
    expect(url).toContain('invoice%5BobjectName%5D=Invoice')
  })

  it('getInvoicePosition returns a position', async () => {
    server.use(
      http.get(`${BASE}/InvoicePos/100`, () =>
        HttpResponse.json({ objects: makeInvoicePos({ id: '100' }) })
      )
    )
    const result = await getInvoicePosition({ id: '100' })
    expect(result.id).toBe('100')
  })

  it('createInvoicePosition with all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/InvoicePos`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoicePos() })
      })
    )
    await createInvoicePosition({
      invoiceId: '10',
      quantity: 2,
      price: 50,
      name: 'Item',
      taxRate: 19,
      unity: 9,
      text: 'Text',
      discount: 5,
      partId: 'P-1',
      positionNumber: 1,
    })
    expect(capturedBody.invoice).toEqual({ id: '10', objectName: 'Invoice' })
    expect(capturedBody.text).toBe('Text')
    expect(capturedBody.discount).toBe(5)
    expect(capturedBody.part).toEqual({ id: 'P-1', objectName: 'Part' })
    expect(capturedBody.positionNumber).toBe(1)
    expect((capturedBody.unity as Record<string, unknown>).id).toBe(9)
  })

  it('createInvoicePosition with minimal fields (defaults unity to 1)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/InvoicePos`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoicePos() })
      })
    )
    await createInvoicePosition({ invoiceId: '10', quantity: 1, price: 100, name: 'Item', taxRate: 19 })
    expect((capturedBody.unity as Record<string, unknown>).id).toBe(1)
    expect(capturedBody.text).toBeUndefined()
    expect(capturedBody.part).toBeUndefined()
  })

  it('updateInvoicePosition sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/InvoicePos/100`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoicePos() })
      })
    )
    await updateInvoicePosition({ id: '100', quantity: 3, price: 200, name: 'Updated', taxRate: 7, text: 'T', discount: 2 })
    expect(capturedBody.quantity).toBe(3)
    expect(capturedBody.discount).toBe(2)
  })

  it('updateInvoicePosition without quantity (quantity false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/InvoicePos/100`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeInvoicePos() })
      })
    )
    await updateInvoicePosition({ id: '100', price: 50 })
    expect(capturedBody.quantity).toBeUndefined()
    expect(capturedBody.price).toBe(50)
  })

  it('deleteInvoicePosition sends DELETE', async () => {
    let deleted = false
    server.use(
      http.delete(`${BASE}/InvoicePos/100`, () => {
        deleted = true
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteInvoicePosition({ id: '100' })
    expect(deleted).toBe(true)
  })
})

describe('userId caching', () => {
  it('calls /SevUser only once across multiple createInvoice calls', async () => {
    let sevUserCallCount = 0
    server.use(
      http.get(`${BASE}/SevUser`, () => {
        sevUserCallCount++
        return HttpResponse.json({ objects: [{ id: 'user-99' }] })
      }),
      http.post(`${BASE}/Invoice/Factory/saveInvoice`, () =>
        HttpResponse.json({ objects: { invoice: makeInvoice() } })
      )
    )
    vi.resetModules()
    const { createInvoice: freshCreate } = await import('../tools/invoices.js')
    await freshCreate({ contactId: '1', positions: [basePosition] })
    await freshCreate({ contactId: '1', positions: [basePosition] })
    expect(sevUserCallCount).toBe(1)
  })
})

describe('formatInvoice', () => {
  it('formats minimal invoice (status 100 = Draft)', () => {
    const invoice = makeInvoice({ status: '100' })
    const output = formatInvoice(invoice)
    expect(output).toContain('Status: Draft')
    expect(output).toContain('Invoice Number: RE-10001')
  })

  it('formats invoice status 50 (Draft not yet finalized)', () => {
    const output = formatInvoice(makeInvoice({ status: '50' }))
    expect(output).toContain('Draft (not yet finalized)')
  })

  it('formats invoice status 200 (Open)', () => {
    const output = formatInvoice(makeInvoice({ status: '200' }))
    expect(output).toContain('Open')
  })

  it('formats invoice status 750 (Partially paid)', () => {
    const output = formatInvoice(makeInvoice({ status: '750' }))
    expect(output).toContain('Partially paid')
  })

  it('formats invoice status 1000 (Paid)', () => {
    const output = formatInvoice(makeInvoice({ status: '1000' }))
    expect(output).toContain('Paid')
  })

  it('formats unknown status with fallback', () => {
    const output = formatInvoice(makeInvoice({ status: '999' }))
    expect(output).toContain('Unknown (999)')
  })

  it('includes optional fields when present', () => {
    const invoice = makeInvoice({
      deliveryDate: '2024-02-01',
      payDate: '2024-02-15',
      paidAmount: 119,
      header: 'My Invoice Header',
      addressName: 'Acme Corp',
      addressStreet: 'Main St 1',
      addressZip: '12345',
      addressCity: 'Berlin',
    })
    const output = formatInvoice(invoice)
    expect(output).toContain('Delivery Date: 2024-02-01')
    expect(output).toContain('Pay Date: 2024-02-15')
    expect(output).toContain('Paid Amount: 119')
    expect(output).toContain('Header: My Invoice Header')
    expect(output).toContain('Address: Acme Corp')
    expect(output).toContain('Street: Main St 1')
    expect(output).toContain('City: 12345 Berlin')
  })

  it('formats address with only zip (no city)', () => {
    const invoice = makeInvoice({ addressName: 'Corp', addressZip: '10115', addressCity: null })
    const output = formatInvoice(invoice)
    expect(output).toContain('City: 10115')
  })

  it('formats address with only city (no zip)', () => {
    const invoice = makeInvoice({ addressName: 'Corp', addressZip: null, addressCity: 'Hamburg' })
    const output = formatInvoice(invoice)
    expect(output).toContain('City: Hamburg')
  })

  it('skips address block when addressName is null', () => {
    const invoice = makeInvoice({ addressName: null })
    const output = formatInvoice(invoice)
    expect(output).not.toContain('Address:')
  })

  it('skips street line when addressStreet is null', () => {
    const invoice = makeInvoice({ addressName: 'Corp', addressStreet: null, addressZip: null, addressCity: null })
    const output = formatInvoice(invoice)
    expect(output).toContain('Address: Corp')
    expect(output).not.toContain('Street:')
  })

  it('skips city line when both zip and city are null', () => {
    const invoice = makeInvoice({ addressName: 'Corp', addressZip: null, addressCity: null })
    const output = formatInvoice(invoice)
    expect(output).not.toContain('City:')
  })

  it('skips paidAmount when null', () => {
    const output = formatInvoice(makeInvoice({ paidAmount: null }))
    expect(output).not.toContain('Paid Amount')
  })

  it('skips Contact ID when contact is null', () => {
    const output = formatInvoice(makeInvoice({ contact: undefined }))
    expect(output).not.toContain('Contact ID:')
  })
})

describe('formatInvoicesList', () => {
  it('returns "No invoices found." for empty array', () => {
    expect(formatInvoicesList([])).toBe('No invoices found.')
  })

  it('lists invoices with status labels', () => {
    const invoices = [
      makeInvoice({ id: '1', status: '100' }),
      makeInvoice({ id: '2', status: '1000' }),
    ]
    const output = formatInvoicesList(invoices)
    expect(output).toContain('Found 2 invoice(s)')
    expect(output).toContain('Draft')
    expect(output).toContain('Paid')
  })
})

describe('format functions', () => {
  it('formatInvoiceResult includes action verb', () => {
    const output = formatInvoiceResult(makeInvoice(), 'created')
    expect(output).toContain('Invoice created successfully')
  })

  it('formatInvoiceDeleteResult includes ID', () => {
    expect(formatInvoiceDeleteResult('10')).toBe('Invoice 10 deleted successfully.')
  })

  it('formatPdfResult includes content info', () => {
    const output = formatPdfResult('abc123', '10')
    expect(output).toContain('Invoice 10 PDF retrieved successfully')
    expect(output).toContain('6 characters')
  })

  it('formatEmailSentResult includes email', () => {
    expect(formatEmailSentResult('10', 'a@b.com')).toContain('a@b.com')
  })

  it('formatStatusChangeResult includes action', () => {
    const output = formatStatusChangeResult(makeInvoice({ status: '200' }), 'reset to open')
    expect(output).toContain('reset to open')
    expect(output).toContain('Open')
  })

  it('formatInvoiceEnshrineResult includes invoice number', () => {
    const output = formatInvoiceEnshrineResult(makeInvoice())
    expect(output).toContain('RE-10001')
    expect(output).toContain('enshrined')
  })

  it('formatPaymentBookedResult includes amount', () => {
    const output = formatPaymentBookedResult(makeInvoice({ paidAmount: 100 }), 100)
    expect(output).toContain('100')
    expect(output).toContain('RE-10001')
  })

  it('formatRecurringInvoiceResult with known interval', () => {
    const invoice = makeInvoice({ accountIntervall: 1, accountNextInvoice: '2025-01-01' })
    const output = formatRecurringInvoiceResult(invoice)
    expect(output).toContain('monthly')
    expect(output).toContain('2025-01-01')
  })

  it('formatRecurringInvoiceResult with unknown interval number', () => {
    const invoice = makeInvoice({ accountIntervall: 99, accountNextInvoice: '2025-01-01' })
    const output = formatRecurringInvoiceResult(invoice)
    expect(output).toContain('interval 99')
  })

  it('formatRecurringInvoiceResult with null accountIntervall shows unknown', () => {
    const invoice = makeInvoice({ accountIntervall: null, accountNextInvoice: null })
    const output = formatRecurringInvoiceResult(invoice)
    expect(output).toContain('unknown')
    expect(output).toContain('n/a')
  })
})

describe('formatInvoicePosition', () => {
  it('formats position with all fields', () => {
    const pos = makeInvoicePos({ text: 'Detail', discount: 10 })
    const output = formatInvoicePosition(pos)
    expect(output).toContain('Name: Test Service')
    expect(output).toContain('Text: Detail')
    expect(output).toContain('Discount: 10%')
  })

  it('formats position without optional fields', () => {
    const pos = makeInvoicePos({ text: null, discount: null })
    const output = formatInvoicePosition(pos)
    expect(output).not.toContain('Text:')
    expect(output).not.toContain('Discount:')
  })
})

describe('formatInvoicePositionsList', () => {
  it('returns message for empty array', () => {
    expect(formatInvoicePositionsList([])).toBe('No invoice positions found.')
  })

  it('lists positions', () => {
    const output = formatInvoicePositionsList([makeInvoicePos()])
    expect(output).toContain('Found 1 position(s)')
    expect(output).toContain('Test Service')
  })
})

describe('position format functions', () => {
  it('formatPositionResult includes action', () => {
    const output = formatPositionResult(makeInvoicePos(), 'created')
    expect(output).toContain('created successfully')
  })

  it('formatPositionDeleteResult includes ID', () => {
    expect(formatPositionDeleteResult('100')).toBe('Invoice position 100 deleted successfully.')
  })
})
