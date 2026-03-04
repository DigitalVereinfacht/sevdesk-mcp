import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeContact } from './mocks/fixtures.js'
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getNextCustomerNumber,
  formatContact,
  formatContactsList,
  formatContactResult,
  formatDeleteResult,
  formatNextCustomerNumber,
} from '../tools/contacts.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listContacts', () => {
  it('uses default limit=100 and depth=0', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Contact`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeContact()] })
      })
    )
    const result = await listContacts({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
    expect(capturedUrl).toContain('depth=0')
  })

  it('passes custom limit and offset', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Contact`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listContacts({ limit: 50, offset: 10 })
    expect(capturedUrl).toContain('limit=50')
    expect(capturedUrl).toContain('offset=10')
  })

  it('filters by customerNumber', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Contact`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listContacts({ customerNumber: 'K-001' })
    expect(capturedUrl).toContain('customerNumber=K-001')
  })

  it('filters by name', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Contact`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listContacts({ name: 'Acme' })
    expect(capturedUrl).toContain('name=Acme')
  })
})

describe('getContact', () => {
  it('fetches a contact by ID and returns single object', async () => {
    const contact = makeContact({ id: '5', name: 'Single Contact' })
    server.use(
      http.get(`${BASE}/Contact/5`, () =>
        HttpResponse.json({ objects: [contact] })
      )
    )
    const result = await getContact({ id: '5' })
    expect(result.id).toBe('5')
    expect(result.name).toBe('Single Contact')
  })

  it('handles direct object response (non-array)', async () => {
    const contact = makeContact({ id: '6' })
    server.use(
      http.get(`${BASE}/Contact/6`, () =>
        HttpResponse.json({ objects: contact })
      )
    )
    const result = await getContact({ id: '6' })
    expect(result.id).toBe('6')
  })
})

describe('createContact', () => {
  it('creates contact with only name', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Contact`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContact({ name: 'Test Corp' }) })
      })
    )
    const result = await createContact({ name: 'Test Corp' })
    expect(capturedBody.name).toBe('Test Corp')
    expect(capturedBody.category).toBeUndefined()
    expect(result.name).toBe('Test Corp')
  })

  it('creates contact without name (omits name field)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Contact`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContact() })
      })
    )
    await createContact({ surename: 'Jane' })
    expect(capturedBody.name).toBeUndefined()
    expect(capturedBody.surename).toBe('Jane')
  })

  it('wraps category in {id, objectName} object', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Contact`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContact() })
      })
    )
    await createContact({ name: 'Corp', category: 3 })
    expect(capturedBody.category).toEqual({ id: 3, objectName: 'Category' })
  })

  it('sends all optional fields when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Contact`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContact() })
      })
    )
    await createContact({
      name: 'Full Corp',
      surename: 'John',
      familyname: 'Doe',
      customerNumber: 'K-999',
      description: 'A client',
      vatNumber: 'DE123456789',
      taxNumber: '12345',
      bankAccount: 'DE89370400440532013000',
      bankNumber: 'COBADEFFXXX',
      defaultTimeToPay: 30,
      titel: 'Mr.',
      academicTitle: 'Dr.',
      gender: 'm',
      birthday: '1980-01-01',
    })
    expect(capturedBody.surename).toBe('John')
    expect(capturedBody.familyname).toBe('Doe')
    expect(capturedBody.vatNumber).toBe('DE123456789')
  })
})

describe('updateContact', () => {
  it('sends only provided fields in update body', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Contact/1`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContact() })
      })
    )
    await updateContact({ id: '1', name: 'Updated Corp' })
    expect(capturedBody.name).toBe('Updated Corp')
    expect(capturedBody.surename).toBeUndefined()
  })

  it('updates without name (name false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Contact/1`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContact() })
      })
    )
    await updateContact({ id: '1', surename: 'NewSurename' })
    expect(capturedBody.name).toBeUndefined()
    expect(capturedBody.surename).toBe('NewSurename')
  })

  it('can update all fields at once', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Contact/1`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeContact() })
      })
    )
    await updateContact({
      id: '1',
      name: 'New Corp',
      surename: 'Jane',
      familyname: 'Smith',
      customerNumber: 'K-002',
      description: 'Updated',
      vatNumber: 'DE000',
      taxNumber: '999',
      bankAccount: 'IBAN',
      bankNumber: 'BIC',
      defaultTimeToPay: 14,
      titel: 'Mrs.',
      academicTitle: 'Prof.',
      gender: 'f',
      birthday: '1990-06-15',
    })
    expect(capturedBody.name).toBe('New Corp')
    expect(capturedBody.gender).toBe('f')
    expect(capturedBody.birthday).toBe('1990-06-15')
  })
})

describe('deleteContact', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/Contact/7`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteContact({ id: '7' })
    expect(capturedUrl).toContain('/Contact/7')
  })
})

describe('getNextCustomerNumber', () => {
  it('returns the next customer number string', async () => {
    server.use(
      http.get(`${BASE}/Contact/Factory/getNextCustomerNumber`, () =>
        HttpResponse.json({ objects: 'K-10005' })
      )
    )
    const result = await getNextCustomerNumber()
    expect(result).toBe('K-10005')
  })
})

describe('formatContact', () => {
  it('formats contact with all optional fields', () => {
    const contact = makeContact({
      customerNumber: 'K-001',
      surename: 'John',
      familyname: 'Doe',
      vatNumber: 'DE123',
      taxNumber: 'TAX123',
      description: 'A supplier',
    })
    const output = formatContact(contact)
    expect(output).toContain('ID: 1')
    expect(output).toContain('Name: Test Company GmbH')
    expect(output).toContain('Customer Number: K-001')
    expect(output).toContain('Full Name: John Doe')
    expect(output).toContain('VAT Number: DE123')
    expect(output).toContain('Tax Number: TAX123')
    expect(output).toContain('Description: A supplier')
    expect(output).toContain('Status: 100')
  })

  it('formats contact without optional fields', () => {
    const contact = makeContact({
      customerNumber: null,
      surename: null,
      familyname: null,
      vatNumber: null,
      taxNumber: null,
      description: null,
    })
    const output = formatContact(contact)
    expect(output).not.toContain('Customer Number')
    expect(output).not.toContain('Full Name')
    expect(output).not.toContain('VAT Number')
    expect(output).not.toContain('Tax Number')
    expect(output).not.toContain('Description')
  })

  it('formats contact with only surename (no familyname)', () => {
    const contact = makeContact({ surename: 'John', familyname: null })
    const output = formatContact(contact)
    expect(output).toContain('Full Name: John')
  })

  it('formats contact with only familyname (no surename)', () => {
    const contact = makeContact({ surename: null, familyname: 'Doe' })
    const output = formatContact(contact)
    expect(output).toContain('Full Name: Doe')
  })
})

describe('formatContactsList', () => {
  it('returns "No contacts found." for empty array', () => {
    expect(formatContactsList([])).toBe('No contacts found.')
  })

  it('lists contacts with customer number', () => {
    const contact = makeContact({ customerNumber: 'K-001' })
    const output = formatContactsList([contact])
    expect(output).toContain('Found 1 contact(s)')
    expect(output).toContain('K-001')
    expect(output).toContain('[1]')
  })

  it('lists contacts without customer number', () => {
    const contact = makeContact({ customerNumber: null })
    const output = formatContactsList([contact])
    expect(output).not.toContain('(null)')
    expect(output).toContain('Test Company GmbH')
  })
})

describe('formatContactResult', () => {
  it('includes action verb in result', () => {
    const contact = makeContact()
    const output = formatContactResult(contact, 'created')
    expect(output).toContain('Contact created successfully')
    expect(output).toContain('ID: 1')
  })
})

describe('formatDeleteResult', () => {
  it('includes contact ID in result', () => {
    const output = formatDeleteResult('42')
    expect(output).toBe('Contact 42 deleted successfully.')
  })
})

describe('formatNextCustomerNumber', () => {
  it('includes the number in result', () => {
    const output = formatNextCustomerNumber('K-99')
    expect(output).toContain('K-99')
  })
})
