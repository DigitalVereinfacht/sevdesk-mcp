import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeContactAddress } from './mocks/fixtures.js'
import {
  listContactAddresses,
  getContactAddress,
  createContactAddress,
  updateContactAddress,
  deleteContactAddress,
  formatContactAddress,
  formatContactAddressesList,
  formatContactAddressResult,
  formatContactAddressDeleteResult,
} from '../tools/addresses.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listContactAddresses', () => {
  it('uses default limit=100', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/ContactAddress`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeContactAddress()] })
      })
    )
    const result = await listContactAddresses({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
  })

  it('passes contactId as bracketed params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/ContactAddress`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listContactAddresses({ contactId: '1' })
    expect(capturedUrl).toContain('contact%5Bid%5D=1')
    expect(capturedUrl).toContain('contact%5BobjectName%5D=Contact')
  })

  it('does not pass contact params without contactId', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/ContactAddress`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listContactAddresses({})
    expect(capturedUrl).not.toContain('contact%5B')
  })
})

describe('getContactAddress', () => {
  it('fetches address by ID', async () => {
    server.use(
      http.get(`${BASE}/ContactAddress/80`, () =>
        HttpResponse.json({ objects: makeContactAddress() })
      )
    )
    const result = await getContactAddress({ id: '80' })
    expect(result.id).toBe('80')
  })
})

describe('createContactAddress', () => {
  it('defaults country to Germany (ID=1) when countryId not provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/ContactAddress`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContactAddress() })
      })
    )
    await createContactAddress({ contactId: '1' })
    expect(capturedBody.contact).toEqual({ id: '1', objectName: 'Contact' })
    expect(capturedBody.country).toEqual({ id: 1, objectName: 'StaticCountry' })
    expect(capturedBody.category).toBeUndefined()
    expect(capturedBody.street).toBeUndefined()
    expect(capturedBody.name2).toBeUndefined()
  })

  it('uses provided countryId', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/ContactAddress`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContactAddress() })
      })
    )
    await createContactAddress({ contactId: '1', countryId: 42 })
    expect((capturedBody.country as Record<string, unknown>).id).toBe(42)
  })

  it('wraps categoryId in {id, objectName} when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/ContactAddress`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContactAddress() })
      })
    )
    await createContactAddress({ contactId: '1', categoryId: 3 })
    expect(capturedBody.category).toEqual({ id: 3, objectName: 'Category' })
  })

  it('includes all optional fields when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/ContactAddress`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContactAddress() })
      })
    )
    await createContactAddress({
      contactId: '1',
      street: 'Main St 1',
      zip: '12345',
      city: 'Berlin',
      name: 'Office',
      name2: 'Floor 2',
      name3: 'Unit B',
      name4: 'P.O. Box',
    })
    expect(capturedBody.street).toBe('Main St 1')
    expect(capturedBody.zip).toBe('12345')
    expect(capturedBody.city).toBe('Berlin')
    expect(capturedBody.name).toBe('Office')
    expect(capturedBody.name2).toBe('Floor 2')
    expect(capturedBody.name3).toBe('Unit B')
    expect(capturedBody.name4).toBe('P.O. Box')
  })
})

describe('updateContactAddress', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/ContactAddress/80`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContactAddress() })
      })
    )
    await updateContactAddress({ id: '80', street: 'New Street 5' })
    expect(capturedBody.street).toBe('New Street 5')
    expect(capturedBody.city).toBeUndefined()
    expect(capturedBody.country).toBeUndefined()
  })

  it('wraps countryId when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/ContactAddress/80`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContactAddress() })
      })
    )
    await updateContactAddress({ id: '80', countryId: 7 })
    expect(capturedBody.country).toEqual({ id: 7, objectName: 'StaticCountry' })
  })

  it('updates all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/ContactAddress/80`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContactAddress() })
      })
    )
    await updateContactAddress({
      id: '80',
      street: 'S',
      zip: 'Z',
      city: 'C',
      countryId: 1,
      name: 'N',
      name2: 'N2',
      name3: 'N3',
      name4: 'N4',
    })
    expect(capturedBody.zip).toBe('Z')
    expect(capturedBody.name2).toBe('N2')
    expect(capturedBody.name3).toBe('N3')
    expect(capturedBody.name4).toBe('N4')
  })
})

describe('deleteContactAddress', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/ContactAddress/80`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteContactAddress({ id: '80' })
    expect(capturedUrl).toContain('/ContactAddress/80')
  })
})

describe('formatContactAddress', () => {
  it('formats address with all optional fields', () => {
    const address = makeContactAddress({
      name: 'Office',
      street: 'Main St 1',
      zip: '12345',
      city: 'Berlin',
    })
    const output = formatContactAddress(address)
    expect(output).toContain('ID: 80')
    expect(output).toContain('Contact ID: 1')
    expect(output).toContain('Name: Office')
    expect(output).toContain('Street: Main St 1')
    expect(output).toContain('City: 12345 Berlin')
    expect(output).toContain('Country ID: 1')
  })

  it('shows only zip when city is null', () => {
    const address = makeContactAddress({ zip: '12345', city: null })
    const output = formatContactAddress(address)
    expect(output).toContain('City: 12345')
  })

  it('shows only city when zip is null', () => {
    const address = makeContactAddress({ zip: null, city: 'Berlin' })
    const output = formatContactAddress(address)
    expect(output).toContain('City: Berlin')
  })

  it('omits city line when both zip and city are null', () => {
    const address = makeContactAddress({ zip: null, city: null })
    const output = formatContactAddress(address)
    expect(output).not.toContain('City:')
  })

  it('omits name when null', () => {
    const address = makeContactAddress({ name: null })
    const output = formatContactAddress(address)
    expect(output).not.toContain('Name:')
  })

  it('omits street when null', () => {
    const address = makeContactAddress({ street: null })
    const output = formatContactAddress(address)
    expect(output).not.toContain('Street:')
  })

  it('omits country when null', () => {
    const address = makeContactAddress({ country: null })
    const output = formatContactAddress(address)
    expect(output).not.toContain('Country ID:')
  })
})

describe('formatContactAddressesList', () => {
  it('returns "No contact addresses found." for empty array', () => {
    expect(formatContactAddressesList([])).toBe('No contact addresses found.')
  })

  it('lists addresses with street/zip/city', () => {
    const address = makeContactAddress({ street: 'Main St 1', zip: '12345', city: 'Berlin' })
    const output = formatContactAddressesList([address])
    expect(output).toContain('Found 1 address(es)')
    expect(output).toContain('Main St 1')
    expect(output).toContain('12345')
    expect(output).toContain('Berlin')
  })

  it('shows "No address details" when all location fields are null', () => {
    const address = makeContactAddress({ street: null, zip: null, city: null })
    const output = formatContactAddressesList([address])
    expect(output).toContain('No address details')
  })
})

describe('formatContactAddressResult', () => {
  it('includes action verb', () => {
    const output = formatContactAddressResult(makeContactAddress(), 'created')
    expect(output).toContain('Contact address created successfully')
  })
})

describe('formatContactAddressDeleteResult', () => {
  it('includes address ID', () => {
    expect(formatContactAddressDeleteResult('80')).toBe('Contact address 80 deleted successfully.')
  })
})
