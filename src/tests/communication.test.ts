import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeCommunicationWay } from './mocks/fixtures.js'
import {
  listCommunicationWays,
  getCommunicationWay,
  createCommunicationWay,
  updateCommunicationWay,
  deleteCommunicationWay,
  formatCommunicationWay,
  formatCommunicationWaysList,
  formatCommunicationWayResult,
  formatCommunicationWayDeleteResult,
} from '../tools/communication.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listCommunicationWays', () => {
  it('uses default limit=100', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CommunicationWay`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeCommunicationWay()] })
      })
    )
    const result = await listCommunicationWays({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
    expect(capturedUrl).not.toContain('contact%5B')
  })

  it('passes contactId as bracketed params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CommunicationWay`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listCommunicationWays({ contactId: '1' })
    expect(capturedUrl).toContain('contact%5Bid%5D=1')
    expect(capturedUrl).toContain('contact%5BobjectName%5D=Contact')
  })

  it('passes type filter', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CommunicationWay`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listCommunicationWays({ type: 'EMAIL' })
    expect(capturedUrl).toContain('type=EMAIL')
  })
})

describe('getCommunicationWay', () => {
  it('fetches communication way by ID', async () => {
    server.use(
      http.get(`${BASE}/CommunicationWay/90`, () =>
        HttpResponse.json({ objects: makeCommunicationWay() })
      )
    )
    const result = await getCommunicationWay({ id: '90' })
    expect(result.id).toBe('90')
  })
})

describe('createCommunicationWay', () => {
  it('sends "1" when main=true', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CommunicationWay`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCommunicationWay() })
      })
    )
    await createCommunicationWay({
      contactId: '1',
      type: 'EMAIL',
      value: 'test@example.com',
      keyId: 1,
      main: true,
    })
    expect(capturedBody.contact).toEqual({ id: '1', objectName: 'Contact' })
    expect(capturedBody.type).toBe('EMAIL')
    expect(capturedBody.value).toBe('test@example.com')
    expect(capturedBody.key).toEqual({ id: 1, objectName: 'CommunicationWayKey' })
    expect(capturedBody.main).toBe('1')
  })

  it('sends "0" when main=false', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CommunicationWay`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCommunicationWay() })
      })
    )
    await createCommunicationWay({
      contactId: '1',
      type: 'PHONE',
      value: '+49123456',
      keyId: 2,
      main: false,
    })
    expect(capturedBody.main).toBe('0')
  })

  it('sends "0" when main is undefined', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CommunicationWay`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCommunicationWay() })
      })
    )
    await createCommunicationWay({
      contactId: '1',
      type: 'WEB',
      value: 'https://example.com',
      keyId: 1,
    })
    expect(capturedBody.main).toBe('0')
  })
})

describe('updateCommunicationWay', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CommunicationWay/90`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCommunicationWay() })
      })
    )
    await updateCommunicationWay({ id: '90', value: 'new@example.com' })
    expect(capturedBody.value).toBe('new@example.com')
    expect(capturedBody.main).toBeUndefined()
  })

  it('sends main="1" when main=true', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CommunicationWay/90`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCommunicationWay() })
      })
    )
    await updateCommunicationWay({ id: '90', main: true })
    expect(capturedBody.main).toBe('1')
  })

  it('sends main="0" when main=false', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CommunicationWay/90`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCommunicationWay() })
      })
    )
    await updateCommunicationWay({ id: '90', main: false })
    expect(capturedBody.main).toBe('0')
  })
})

describe('deleteCommunicationWay', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/CommunicationWay/90`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteCommunicationWay({ id: '90' })
    expect(capturedUrl).toContain('/CommunicationWay/90')
  })
})

describe('formatCommunicationWay', () => {
  it('formats EMAIL type with main="0" → No', () => {
    const cw = makeCommunicationWay({ type: 'EMAIL', main: '0' })
    const output = formatCommunicationWay(cw)
    expect(output).toContain('ID: 90')
    expect(output).toContain('Contact ID: 1')
    expect(output).toContain('Type: Email')
    expect(output).toContain('Value: test@example.com')
    expect(output).toContain('Main: No')
  })

  it('formats main="1" → Yes', () => {
    const cw = makeCommunicationWay({ main: '1' })
    const output = formatCommunicationWay(cw)
    expect(output).toContain('Main: Yes')
  })

  it('formats PHONE type', () => {
    const cw = makeCommunicationWay({ type: 'PHONE' })
    expect(formatCommunicationWay(cw)).toContain('Type: Phone')
  })

  it('formats WEB type', () => {
    const cw = makeCommunicationWay({ type: 'WEB' })
    expect(formatCommunicationWay(cw)).toContain('Type: Website')
  })

  it('formats MOBILE type', () => {
    const cw = makeCommunicationWay({ type: 'MOBILE' })
    expect(formatCommunicationWay(cw)).toContain('Type: Mobile')
  })

  it('formats FAX type', () => {
    const cw = makeCommunicationWay({ type: 'FAX' })
    expect(formatCommunicationWay(cw)).toContain('Type: Fax')
  })

  it('formats unknown type as-is', () => {
    const cw = makeCommunicationWay({ type: 'CUSTOM' })
    expect(formatCommunicationWay(cw)).toContain('Type: CUSTOM')
  })
})

describe('formatCommunicationWaysList', () => {
  it('returns "No communication ways found." for empty array', () => {
    expect(formatCommunicationWaysList([])).toBe('No communication ways found.')
  })

  it('includes [MAIN] for main="1"', () => {
    const cw = makeCommunicationWay({ main: '1' })
    const output = formatCommunicationWaysList([cw])
    expect(output).toContain('Found 1 communication way(s)')
    expect(output).toContain('[MAIN]')
  })

  it('omits [MAIN] for main="0"', () => {
    const cw = makeCommunicationWay({ main: '0' })
    const output = formatCommunicationWaysList([cw])
    expect(output).not.toContain('[MAIN]')
  })
})

describe('formatCommunicationWayResult', () => {
  it('includes action verb', () => {
    const output = formatCommunicationWayResult(makeCommunicationWay(), 'created')
    expect(output).toContain('Communication way created successfully')
  })
})

describe('formatCommunicationWayDeleteResult', () => {
  it('includes communication way ID', () => {
    expect(formatCommunicationWayDeleteResult('90')).toBe('Communication way 90 deleted successfully.')
  })
})
