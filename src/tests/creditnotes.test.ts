import { describe, it, expect, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeCreditNote, makeCreditNotePos } from './mocks/fixtures.js'
import {
  listCreditNotes,
  getCreditNote,
  createCreditNote,
  updateCreditNote,
  deleteCreditNote,
  getCreditNotePdf,
  sendCreditNoteEmail,
  resetCreditNoteToDraft,
  resetCreditNoteToOpen,
  listCreditNotePositions,
  getCreditNotePosition,
  createCreditNotePosition,
  updateCreditNotePosition,
  deleteCreditNotePosition,
  formatCreditNote,
  formatCreditNotesList,
  formatCreditNoteStatusChangeResult,
  formatCreditNoteResult,
  formatCreditNoteDeleteResult,
  formatCreditNotePdfResult,
  formatCreditNoteEmailSentResult,
  formatCreditNotePosition,
  formatCreditNotePositionsList,
  formatCreditNotePositionResult,
  formatCreditNotePositionDeleteResult,
} from '../tools/creditnotes.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listCreditNotes', () => {
  it('uses default limit=100 and depth=0', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CreditNote`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeCreditNote()] })
      })
    )
    const result = await listCreditNotes({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
    expect(capturedUrl).toContain('depth=0')
  })

  it('passes status filter', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CreditNote`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listCreditNotes({ status: '100' })
    expect(capturedUrl).toContain('status=100')
  })

  it('passes creditNoteNumber filter', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CreditNote`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listCreditNotes({ creditNoteNumber: 'GS-001' })
    expect(capturedUrl).toContain('creditNoteNumber=GS-001')
  })

  it('passes date range filters', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CreditNote`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listCreditNotes({ startDate: '2024-01-01', endDate: '2024-12-31' })
    expect(capturedUrl).toContain('startDate=2024-01-01')
    expect(capturedUrl).toContain('endDate=2024-12-31')
  })

  it('passes contactId as bracketed params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CreditNote`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listCreditNotes({ contactId: '1' })
    expect(capturedUrl).toContain('contact%5Bid%5D=1')
    expect(capturedUrl).toContain('contact%5BobjectName%5D=Contact')
  })
})

describe('getCreditNote', () => {
  it('fetches credit note by ID', async () => {
    const cn = makeCreditNote({ id: '50' })
    server.use(
      http.get(`${BASE}/CreditNote/50`, () => HttpResponse.json({ objects: cn }))
    )
    const result = await getCreditNote({ id: '50' })
    expect(result.id).toBe('50')
  })
})

describe('createCreditNote', () => {
  it('defaults creditNoteDate to today', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
      })
    )
    await createCreditNote({
      contactId: '1',
      positions: [{ quantity: 1, price: 100, name: 'Service', taxRate: 19 }],
    })
    const cn = capturedBody.creditNote as Record<string, unknown>
    expect(cn.creditNoteDate).toBe('2024-06-15')
    vi.useRealTimers()
  })

  it('uses provided creditNoteDate', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
      })
    )
    await createCreditNote({
      contactId: '1',
      creditNoteDate: '2024-03-01',
      positions: [{ quantity: 1, price: 100, name: 'Service', taxRate: 19 }],
    })
    const cn = capturedBody.creditNote as Record<string, unknown>
    expect(cn.creditNoteDate).toBe('2024-03-01')
  })

  it('forces taxType="default" when taxRule is provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
      })
    )
    await createCreditNote({
      contactId: '1',
      taxRule: 1,
      taxType: 'eu',
      positions: [{ quantity: 1, price: 100, name: 'S', taxRate: 19 }],
    })
    const cn = capturedBody.creditNote as Record<string, unknown>
    expect(cn.taxType).toBe('default')
    expect(cn.taxRule).toEqual({ id: 1, objectName: 'TaxRule' })
  })

  it('uses provided taxType when no taxRule', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
      })
    )
    await createCreditNote({
      contactId: '1',
      taxType: 'eu',
      positions: [{ quantity: 1, price: 100, name: 'S', taxRate: 0 }],
    })
    const cn = capturedBody.creditNote as Record<string, unknown>
    expect(cn.taxType).toBe('eu')
    expect(cn.taxRule).toBeUndefined()
  })

  it('sets showNet=false when explicitly false', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
      })
    )
    await createCreditNote({
      contactId: '1',
      showNet: false,
      positions: [{ quantity: 1, price: 10, name: 'S', taxRate: 0 }],
    })
    const cn = capturedBody.creditNote as Record<string, unknown>
    expect(cn.showNet).toBe(false)
  })

  it('includes all optional header/footer fields and bookingCategory', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
      })
    )
    await createCreditNote({
      contactId: '1',
      header: 'CN Header',
      headText: 'Head',
      footText: 'Foot',
      bookingCategory: 'CAT1',
      positions: [{ quantity: 1, price: 10, name: 'S', taxRate: 0 }],
    })
    const cn = capturedBody.creditNote as Record<string, unknown>
    expect(cn.header).toBe('CN Header')
    expect(cn.headText).toBe('Head')
    expect(cn.footText).toBe('Foot')
    expect(cn.bookingCategory).toBe('CAT1')
  })

  it('maps positions with optional text/discount/partId', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/Factory/saveCreditNote`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { creditNote: makeCreditNote() } })
      })
    )
    await createCreditNote({
      contactId: '1',
      positions: [
        {
          quantity: 2,
          price: 50,
          name: 'Product',
          taxRate: 19,
          unity: 9,
          text: 'Details',
          discount: 5,
          partId: 'P-1',
        },
      ],
    })
    const positions = capturedBody.creditNotePosSave as Record<string, unknown>[]
    expect(positions[0].text).toBe('Details')
    expect(positions[0].discount).toBe(5)
    expect(positions[0].part).toEqual({ id: 'P-1', objectName: 'Part' })
    expect((positions[0].unity as Record<string, unknown>).id).toBe(9)
  })
})

describe('createCreditNote userId caching', () => {
  it('calls /SevUser only once for multiple creates', async () => {
    vi.resetModules()
    let sevUserCalls = 0
    server.use(
      http.get(`${BASE}/SevUser`, () => {
        sevUserCalls++
        return HttpResponse.json({ objects: [{ id: '42' }] })
      })
    )

    const { createCreditNote: freshCreate } = await import('../tools/creditnotes.js')

    await freshCreate({
      contactId: '1',
      positions: [{ quantity: 1, price: 10, name: 'S', taxRate: 0 }],
    })
    await freshCreate({
      contactId: '2',
      positions: [{ quantity: 1, price: 10, name: 'S', taxRate: 0 }],
    })

    expect(sevUserCalls).toBe(1)
  })
})

describe('updateCreditNote', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CreditNote/50`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNote() })
      })
    )
    await updateCreditNote({ id: '50', header: 'Updated Header' })
    expect(capturedBody.header).toBe('Updated Header')
    expect(capturedBody.headText).toBeUndefined()
  })

  it('updates without header (header false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CreditNote/50`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNote() })
      })
    )
    await updateCreditNote({ id: '50', headText: 'Only head text' })
    expect(capturedBody.header).toBeUndefined()
    expect(capturedBody.headText).toBe('Only head text')
  })

  it('updates all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CreditNote/50`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNote() })
      })
    )
    await updateCreditNote({
      id: '50',
      header: 'H',
      headText: 'HT',
      footText: 'FT',
      customerInternalNote: 'Note',
    })
    expect(capturedBody.headText).toBe('HT')
    expect(capturedBody.footText).toBe('FT')
    expect(capturedBody.customerInternalNote).toBe('Note')
  })
})

describe('deleteCreditNote', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/CreditNote/50`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteCreditNote({ id: '50' })
    expect(capturedUrl).toContain('/CreditNote/50')
  })
})

describe('getCreditNotePdf', () => {
  it('returns base64 content', async () => {
    server.use(
      http.get(`${BASE}/CreditNote/50/getPdf`, () =>
        HttpResponse.json({ objects: { content: 'base64pdf' } })
      )
    )
    const result = await getCreditNotePdf({ id: '50' })
    expect(result).toBe('base64pdf')
  })

  it('includes download=true param when requested', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CreditNote/50/getPdf`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { content: 'pdf' } })
      })
    )
    await getCreditNotePdf({ id: '50', download: true })
    expect(capturedUrl).toContain('download=true')
  })
})

describe('sendCreditNoteEmail', () => {
  it('sends email without copy by default', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/50/sendViaEmail`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: {} })
      })
    )
    await sendCreditNoteEmail({ id: '50', email: 'a@b.com', subject: 'Sub', text: 'Body' })
    expect(capturedBody.toEmail).toBe('a@b.com')
    expect(capturedBody.copy).toBe(false)
  })

  it('sends email with copy=true', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNote/50/sendViaEmail`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: {} })
      })
    )
    await sendCreditNoteEmail({ id: '50', email: 'a@b.com', subject: 'Sub', text: 'Body', copy: true })
    expect(capturedBody.copy).toBe(true)
  })
})

describe('resetCreditNoteToDraft', () => {
  it('calls correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.put(`${BASE}/CreditNote/50/resetToDraft`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: makeCreditNote({ status: '100' }) })
      })
    )
    const result = await resetCreditNoteToDraft({ id: '50' })
    expect(capturedUrl).toContain('/CreditNote/50/resetToDraft')
    expect(result.status).toBe('100')
  })
})

describe('resetCreditNoteToOpen', () => {
  it('calls correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.put(`${BASE}/CreditNote/50/resetToOpen`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: makeCreditNote({ status: '200' }) })
      })
    )
    const result = await resetCreditNoteToOpen({ id: '50' })
    expect(capturedUrl).toContain('/CreditNote/50/resetToOpen')
    expect(result.status).toBe('200')
  })
})

describe('listCreditNotePositions', () => {
  it('passes creditNoteId as bracketed params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CreditNotePos`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeCreditNotePos()] })
      })
    )
    await listCreditNotePositions({ creditNoteId: '50' })
    expect(capturedUrl).toContain('creditNote%5Bid%5D=50')
    expect(capturedUrl).toContain('creditNote%5BobjectName%5D=CreditNote')
  })
})

describe('getCreditNotePosition', () => {
  it('fetches position by ID', async () => {
    server.use(
      http.get(`${BASE}/CreditNotePos/500`, () =>
        HttpResponse.json({ objects: makeCreditNotePos() })
      )
    )
    const result = await getCreditNotePosition({ id: '500' })
    expect(result.id).toBe('500')
  })
})

describe('createCreditNotePosition', () => {
  it('creates position with required fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNotePos`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNotePos() })
      })
    )
    await createCreditNotePosition({
      creditNoteId: '50',
      quantity: 1,
      price: 100,
      name: 'Service',
      taxRate: 19,
    })
    expect(capturedBody.creditNote).toEqual({ id: '50', objectName: 'CreditNote' })
    expect(capturedBody.unity).toEqual({ id: 1, objectName: 'Unity' })
    expect(capturedBody.text).toBeUndefined()
    expect(capturedBody.part).toBeUndefined()
  })

  it('includes optional text, discount, partId', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CreditNotePos`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNotePos() })
      })
    )
    await createCreditNotePosition({
      creditNoteId: '50',
      quantity: 2,
      price: 50,
      name: 'Product',
      taxRate: 7,
      unity: 9,
      text: 'Info',
      discount: 10,
      partId: 'P-3',
    })
    expect(capturedBody.text).toBe('Info')
    expect(capturedBody.discount).toBe(10)
    expect(capturedBody.part).toEqual({ id: 'P-3', objectName: 'Part' })
    expect((capturedBody.unity as Record<string, unknown>).id).toBe(9)
  })
})

describe('updateCreditNotePosition', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CreditNotePos/500`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNotePos() })
      })
    )
    await updateCreditNotePosition({ id: '500', quantity: 5 })
    expect(capturedBody.quantity).toBe(5)
    expect(capturedBody.price).toBeUndefined()
  })

  it('updates without quantity (quantity false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CreditNotePos/500`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNotePos() })
      })
    )
    await updateCreditNotePosition({ id: '500', price: 50 })
    expect(capturedBody.quantity).toBeUndefined()
    expect(capturedBody.price).toBe(50)
  })

  it('updates all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CreditNotePos/500`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCreditNotePos() })
      })
    )
    await updateCreditNotePosition({
      id: '500',
      quantity: 3,
      price: 75,
      name: 'Updated',
      taxRate: 7,
      text: 'T',
      discount: 5,
    })
    expect(capturedBody.price).toBe(75)
    expect(capturedBody.text).toBe('T')
    expect(capturedBody.discount).toBe(5)
  })
})

describe('deleteCreditNotePosition', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/CreditNotePos/500`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteCreditNotePosition({ id: '500' })
    expect(capturedUrl).toContain('/CreditNotePos/500')
  })
})

describe('formatCreditNote', () => {
  it('formats credit note with status 100 → Draft', () => {
    const cn = makeCreditNote({ status: '100' })
    const output = formatCreditNote(cn)
    expect(output).toContain('ID: 50')
    expect(output).toContain('Credit Note Number: GS-10001')
    expect(output).toContain('Status: Draft')
    expect(output).toContain('Contact ID: 1')
  })

  it('formats status 200 → Open', () => {
    expect(formatCreditNote(makeCreditNote({ status: '200' }))).toContain('Status: Open')
  })

  it('formats status 1000 → Paid/Booked', () => {
    expect(formatCreditNote(makeCreditNote({ status: '1000' }))).toContain('Status: Paid/Booked')
  })

  it('formats unknown status', () => {
    expect(formatCreditNote(makeCreditNote({ status: '999' }))).toContain('Status: Unknown (999)')
  })

  it('includes header when present', () => {
    const output = formatCreditNote(makeCreditNote({ header: 'CN Header' }))
    expect(output).toContain('Header: CN Header')
  })

  it('omits header when null', () => {
    const output = formatCreditNote(makeCreditNote({ header: null }))
    expect(output).not.toContain('Header:')
  })

  it('omits contact when null', () => {
    const output = formatCreditNote(makeCreditNote({ contact: null }))
    expect(output).not.toContain('Contact ID:')
  })
})

describe('formatCreditNotesList', () => {
  it('returns "No credit notes found." for empty array', () => {
    expect(formatCreditNotesList([])).toBe('No credit notes found.')
  })

  it('lists credit notes with status labels', () => {
    const notes = [
      makeCreditNote({ status: '100' }),
      makeCreditNote({ id: '51', status: '200' }),
    ]
    const output = formatCreditNotesList(notes)
    expect(output).toContain('Found 2 credit note(s)')
    expect(output).toContain('Draft')
    expect(output).toContain('Open')
  })
})

describe('formatCreditNoteStatusChangeResult', () => {
  it('includes credit note number and status label', () => {
    const output = formatCreditNoteStatusChangeResult(makeCreditNote({ status: '100' }), 'reset to draft')
    expect(output).toContain('GS-10001')
    expect(output).toContain('Draft')
    expect(output).toContain('reset to draft')
  })
})

describe('formatCreditNoteResult', () => {
  it('includes action verb', () => {
    const output = formatCreditNoteResult(makeCreditNote(), 'created')
    expect(output).toContain('Credit note created successfully')
    expect(output).toContain('ID: 50')
  })
})

describe('formatCreditNoteDeleteResult', () => {
  it('includes credit note ID', () => {
    expect(formatCreditNoteDeleteResult('50')).toBe('Credit note 50 deleted successfully.')
  })
})

describe('formatCreditNotePdfResult', () => {
  it('includes credit note ID and content length', () => {
    const output = formatCreditNotePdfResult('base64', '50')
    expect(output).toContain('Credit note 50 PDF retrieved successfully')
    expect(output).toContain('6 characters')
  })
})

describe('formatCreditNoteEmailSentResult', () => {
  it('includes credit note ID and email', () => {
    const output = formatCreditNoteEmailSentResult('50', 'client@example.com')
    expect(output).toContain('Credit note 50')
    expect(output).toContain('client@example.com')
  })
})

describe('formatCreditNotePosition', () => {
  it('formats position without optional text/discount', () => {
    const pos = makeCreditNotePos({ text: null, discount: null })
    const output = formatCreditNotePosition(pos)
    expect(output).toContain('ID: 500')
    expect(output).toContain('Name: Test Service')
    expect(output).not.toContain('Text:')
    expect(output).not.toContain('Discount:')
  })

  it('includes text and discount when present', () => {
    const pos = makeCreditNotePos({ text: 'Details', discount: 10 })
    const output = formatCreditNotePosition(pos)
    expect(output).toContain('Text: Details')
    expect(output).toContain('Discount: 10%')
  })
})

describe('formatCreditNotePositionsList', () => {
  it('returns "No credit note positions found." for empty array', () => {
    expect(formatCreditNotePositionsList([])).toBe('No credit note positions found.')
  })

  it('lists positions', () => {
    const output = formatCreditNotePositionsList([makeCreditNotePos()])
    expect(output).toContain('Found 1 position(s)')
    expect(output).toContain('[500]')
  })
})

describe('formatCreditNotePositionResult', () => {
  it('includes action verb', () => {
    const output = formatCreditNotePositionResult(makeCreditNotePos(), 'created')
    expect(output).toContain('Credit note position created successfully')
  })
})

describe('formatCreditNotePositionDeleteResult', () => {
  it('includes position ID', () => {
    expect(formatCreditNotePositionDeleteResult('500')).toBe('Credit note position 500 deleted successfully.')
  })
})
