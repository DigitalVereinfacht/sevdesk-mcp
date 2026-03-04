import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makePart } from './mocks/fixtures.js'
import {
  listParts,
  getPart,
  createPart,
  updatePart,
  deletePart,
  getPartStock,
  formatPart,
  formatPartsList,
  formatPartResult,
  formatPartDeleteResult,
  formatStockResult,
} from '../tools/parts.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listParts', () => {
  it('uses default limit=100 and depth=0', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Part`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makePart()] })
      })
    )
    const result = await listParts({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
    expect(capturedUrl).toContain('depth=0')
  })

  it('filters by partNumber', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Part`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listParts({ partNumber: 'P-001' })
    expect(capturedUrl).toContain('partNumber=P-001')
  })

  it('filters by name', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Part`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listParts({ name: 'Widget' })
    expect(capturedUrl).toContain('name=Widget')
  })
})

describe('getPart', () => {
  it('fetches part by ID', async () => {
    server.use(
      http.get(`${BASE}/Part/60`, () => HttpResponse.json({ objects: makePart() }))
    )
    const result = await getPart({ id: '60' })
    expect(result.id).toBe('60')
  })
})

describe('createPart', () => {
  it('creates part with only required fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Part`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makePart() })
      })
    )
    await createPart({ name: 'Widget', taxRate: 19 })
    expect(capturedBody.name).toBe('Widget')
    expect(capturedBody.taxRate).toBe(19)
    expect(capturedBody.unity).toEqual({ id: 1, objectName: 'Unity' })
    expect(capturedBody.status).toBe('100')
    expect(capturedBody.partNumber).toBeUndefined()
    expect(capturedBody.category).toBeUndefined()
    expect(capturedBody.pricePurchase).toBeUndefined()
  })

  it('includes partNumber when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Part`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makePart() })
      })
    )
    await createPart({ name: 'Widget', taxRate: 7, partNumber: 'P-999' })
    expect(capturedBody.partNumber).toBe('P-999')
  })

  it('wraps categoryId in {id, objectName} object', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Part`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makePart() })
      })
    )
    await createPart({ name: 'Widget', taxRate: 19, categoryId: 5 })
    expect(capturedBody.category).toEqual({ id: 5, objectName: 'Category' })
  })

  it('includes all optional fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Part`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makePart() })
      })
    )
    await createPart({
      name: 'Full Part',
      taxRate: 19,
      text: 'Description',
      priceNet: 99.99,
      priceGross: 118.99,
      stock: 50,
      stockEnabled: true,
      pricePurchase: 60,
      internalComment: 'Internal',
      unity: 9,
    })
    expect(capturedBody.text).toBe('Description')
    expect(capturedBody.priceNet).toBe(99.99)
    expect(capturedBody.priceGross).toBe(118.99)
    expect(capturedBody.stock).toBe(50)
    expect(capturedBody.stockEnabled).toBe(true)
    expect(capturedBody.pricePurchase).toBe(60)
    expect(capturedBody.internalComment).toBe('Internal')
    expect((capturedBody.unity as Record<string, unknown>).id).toBe(9)
  })
})

describe('updatePart', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Part/60`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makePart() })
      })
    )
    await updatePart({ id: '60', name: 'Updated Widget' })
    expect(capturedBody.name).toBe('Updated Widget')
    expect(capturedBody.taxRate).toBeUndefined()
    expect(capturedBody.priceNet).toBeUndefined()
  })

  it('updates without name (name false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Part/60`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makePart() })
      })
    )
    await updatePart({ id: '60', taxRate: 7 })
    expect(capturedBody.name).toBeUndefined()
    expect(capturedBody.taxRate).toBe(7)
  })

  it('updates all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Part/60`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makePart() })
      })
    )
    await updatePart({
      id: '60',
      name: 'N',
      partNumber: 'P-X',
      text: 'T',
      priceNet: 50,
      priceGross: 59.5,
      taxRate: 19,
      stock: 10,
      stockEnabled: false,
      pricePurchase: 30,
      internalComment: 'IC',
      status: '200',
    })
    expect(capturedBody.partNumber).toBe('P-X')
    expect(capturedBody.priceNet).toBe(50)
    expect(capturedBody.stockEnabled).toBe(false)
    expect(capturedBody.status).toBe('200')
  })
})

describe('deletePart', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/Part/60`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deletePart({ id: '60' })
    expect(capturedUrl).toContain('/Part/60')
  })
})

describe('getPartStock', () => {
  it('returns numeric stock', async () => {
    server.use(
      http.get(`${BASE}/Part/60/getStock`, () =>
        HttpResponse.json({ objects: 42 })
      )
    )
    const result = await getPartStock({ id: '60' })
    expect(result).toBe(42)
  })
})

describe('formatPart', () => {
  it('formats part with null optional prices and no stockEnabled', () => {
    const part = makePart({
      priceNet: null,
      priceGross: null,
      pricePurchase: null,
      text: null,
      stockEnabled: false,
      internalComment: null,
    })
    const output = formatPart(part)
    expect(output).toContain('ID: 60')
    expect(output).toContain('Name: Test Part')
    expect(output).toContain('Part Number: P-001')
    expect(output).not.toContain('Price (net):')
    expect(output).not.toContain('Price (gross):')
    expect(output).not.toContain('Purchase Price:')
    expect(output).not.toContain('Description:')
    expect(output).not.toContain('Stock:')
    expect(output).not.toContain('Internal Comment:')
  })

  it('formats part with all optional fields', () => {
    const part = makePart({
      priceNet: 99.99,
      priceGross: 118.99,
      pricePurchase: 60,
      text: 'A product',
      stockEnabled: true,
      stock: 25,
      internalComment: 'For internal use',
    })
    const output = formatPart(part)
    expect(output).toContain('Price (net): 99.99')
    expect(output).toContain('Price (gross): 118.99')
    expect(output).toContain('Purchase Price: 60')
    expect(output).toContain('Description: A product')
    expect(output).toContain('Stock: 25')
    expect(output).toContain('Stock Enabled: Yes')
    expect(output).toContain('Internal Comment: For internal use')
  })
})

describe('formatPartsList', () => {
  it('returns "No parts found." for empty array', () => {
    expect(formatPartsList([])).toBe('No parts found.')
  })

  it('shows priceNet when not null', () => {
    const part = makePart({ priceNet: 49.99 })
    const output = formatPartsList([part])
    expect(output).toContain('Found 1 part(s)')
    expect(output).toContain('49.99')
  })

  it('shows "N/A" when priceNet is null', () => {
    const part = makePart({ priceNet: null })
    const output = formatPartsList([part])
    expect(output).toContain('N/A')
  })
})

describe('formatPartResult', () => {
  it('includes action verb', () => {
    const output = formatPartResult(makePart(), 'created')
    expect(output).toContain('Part created successfully')
    expect(output).toContain('ID: 60')
  })
})

describe('formatPartDeleteResult', () => {
  it('includes part ID', () => {
    expect(formatPartDeleteResult('60')).toBe('Part 60 deleted successfully.')
  })
})

describe('formatStockResult', () => {
  it('includes part ID and stock amount', () => {
    expect(formatStockResult(42, '60')).toContain('Part 60 current stock: 42')
  })

  it('works with zero stock', () => {
    expect(formatStockResult(0, '60')).toContain('current stock: 0')
  })
})
