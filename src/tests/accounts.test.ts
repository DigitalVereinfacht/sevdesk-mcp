import { describe, it, expect, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeCheckAccount, makeTransaction } from './mocks/fixtures.js'
import {
  listCheckAccounts,
  getCheckAccount,
  getCheckAccountBalance,
  createCheckAccount,
  updateCheckAccount,
  deleteCheckAccount,
  formatCheckAccount,
  formatCheckAccountsList,
  formatBalance,
  formatCheckAccountResult,
  formatCheckAccountDeleteResult,
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  formatTransaction,
  formatTransactionsList,
  formatTransactionResult,
  formatTransactionDeleteResult,
} from '../tools/accounts.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listCheckAccounts', () => {
  it('uses default limit=100 and depth=0', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccount`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeCheckAccount()] })
      })
    )
    const result = await listCheckAccounts({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
    expect(capturedUrl).toContain('depth=0')
  })

  it('passes custom limit and offset', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccount`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listCheckAccounts({ limit: 20, offset: 5 })
    expect(capturedUrl).toContain('limit=20')
    expect(capturedUrl).toContain('offset=5')
  })
})

describe('getCheckAccount', () => {
  it('fetches account by ID', async () => {
    const account = makeCheckAccount({ id: '30' })
    server.use(
      http.get(`${BASE}/CheckAccount/30`, () =>
        HttpResponse.json({ objects: account })
      )
    )
    const result = await getCheckAccount({ id: '30' })
    expect(result.id).toBe('30')
  })
})

describe('getCheckAccountBalance', () => {
  it('passes provided date', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccount/30/getBalanceAtDate`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: '1500.00' })
      })
    )
    const result = await getCheckAccountBalance({ id: '30', date: '2024-06-01' })
    expect(result).toBe('1500.00')
    expect(capturedUrl).toContain('date=2024-06-01')
  })

  it('defaults to today when date not provided', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-09-15'))
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccount/30/getBalanceAtDate`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: '2000.00' })
      })
    )
    await getCheckAccountBalance({ id: '30' })
    expect(capturedUrl).toContain('date=2024-09-15')
    vi.useRealTimers()
  })
})

describe('createCheckAccount', () => {
  it('creates account with type and default currency EUR', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CheckAccount`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await createCheckAccount({ name: 'Test Bank', type: 'online' })
    expect(capturedBody.name).toBe('Test Bank')
    expect(capturedBody.type).toBe('online')
    expect(capturedBody.currency).toBe('EUR')
    expect(capturedBody.status).toBe('100')
    expect(capturedBody.importType).toBeUndefined()
    expect(capturedBody.defaultAccount).toBeUndefined()
  })

  it('sets defaultAccount="1" when true', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CheckAccount`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await createCheckAccount({ name: 'Bank', type: 'offline', defaultAccount: true })
    expect(capturedBody.defaultAccount).toBe('1')
  })

  it('sets defaultAccount="0" when false', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CheckAccount`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await createCheckAccount({ name: 'Bank', type: 'offline', defaultAccount: false })
    expect(capturedBody.defaultAccount).toBe('0')
  })

  it('includes importType when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CheckAccount`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await createCheckAccount({ name: 'Bank', type: 'online', importType: 'CSV' })
    expect(capturedBody.importType).toBe('CSV')
  })

  it('uses custom currency', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CheckAccount`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await createCheckAccount({ name: 'Bank', type: 'online', currency: 'USD' })
    expect(capturedBody.currency).toBe('USD')
  })
})

describe('updateCheckAccount', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CheckAccount/30`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await updateCheckAccount({ id: '30', name: 'Updated Name' })
    expect(capturedBody.name).toBe('Updated Name')
    expect(capturedBody.currency).toBeUndefined()
    expect(capturedBody.defaultAccount).toBeUndefined()
  })

  it('toggles defaultAccount', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CheckAccount/30`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await updateCheckAccount({ id: '30', defaultAccount: true })
    expect(capturedBody.defaultAccount).toBe('1')
  })

  it('updates all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CheckAccount/30`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeCheckAccount() })
      })
    )
    await updateCheckAccount({ id: '30', name: 'N', currency: 'USD', defaultAccount: false, status: '200' })
    expect(capturedBody.currency).toBe('USD')
    expect(capturedBody.defaultAccount).toBe('0')
    expect(capturedBody.status).toBe('200')
  })
})

describe('deleteCheckAccount', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/CheckAccount/30`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteCheckAccount({ id: '30' })
    expect(capturedUrl).toContain('/CheckAccount/30')
  })
})

describe('formatCheckAccount', () => {
  it('formats account with defaultAccount="0" → No', () => {
    const account = makeCheckAccount({ defaultAccount: '0', type: 'online' })
    const output = formatCheckAccount(account)
    expect(output).toContain('ID: 30')
    expect(output).toContain('Type: Online Banking')
    expect(output).toContain('Default Account: No')
    expect(output).not.toContain('Import Type:')
    expect(output).not.toContain('Bank Server:')
  })

  it('formats account with defaultAccount="1" → Yes', () => {
    const account = makeCheckAccount({ defaultAccount: '1' })
    const output = formatCheckAccount(account)
    expect(output).toContain('Default Account: Yes')
  })

  it('formats offline account type', () => {
    const account = makeCheckAccount({ type: 'offline' })
    const output = formatCheckAccount(account)
    expect(output).toContain('Type: Offline/Manual')
  })

  it('formats unknown account type as-is', () => {
    const account = makeCheckAccount({ type: 'custom' })
    const output = formatCheckAccount(account)
    expect(output).toContain('Type: custom')
  })

  it('includes importType when present', () => {
    const account = makeCheckAccount({ importType: 'CSV' })
    const output = formatCheckAccount(account)
    expect(output).toContain('Import Type: CSV')
  })

  it('includes bankServer when present', () => {
    const account = makeCheckAccount({ bankServer: 'bank.example.com' })
    const output = formatCheckAccount(account)
    expect(output).toContain('Bank Server: bank.example.com')
  })
})

describe('formatCheckAccountsList', () => {
  it('returns "No bank accounts found." for empty array', () => {
    expect(formatCheckAccountsList([])).toBe('No bank accounts found.')
  })

  it('includes [DEFAULT] for default account', () => {
    const accounts = [
      makeCheckAccount({ defaultAccount: '1' }),
      makeCheckAccount({ id: '31', defaultAccount: '0' }),
    ]
    const output = formatCheckAccountsList(accounts)
    expect(output).toContain('Found 2 bank account(s)')
    expect(output).toContain('[DEFAULT]')
  })

  it('omits [DEFAULT] for non-default accounts', () => {
    const output = formatCheckAccountsList([makeCheckAccount({ defaultAccount: '0' })])
    expect(output).not.toContain('[DEFAULT]')
  })
})

describe('formatBalance', () => {
  it('includes account ID, date, and balance', () => {
    const output = formatBalance('1500.00', '30', '2024-06-01')
    expect(output).toContain('Account 30')
    expect(output).toContain('2024-06-01')
    expect(output).toContain('1500.00')
  })

  it('defaults to today when date not provided', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-09-15'))
    const output = formatBalance('500.00', '30')
    expect(output).toContain('2024-09-15')
    vi.useRealTimers()
  })
})

describe('formatCheckAccountResult', () => {
  it('includes action verb', () => {
    const output = formatCheckAccountResult(makeCheckAccount(), 'created')
    expect(output).toContain('Check account created successfully')
  })
})

describe('formatCheckAccountDeleteResult', () => {
  it('includes account ID', () => {
    expect(formatCheckAccountDeleteResult('30')).toBe('Check account 30 deleted successfully.')
  })
})

describe('listTransactions', () => {
  it('uses default limit=100', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccountTransaction`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeTransaction()] })
      })
    )
    await listTransactions({})
    expect(capturedUrl).toContain('limit=100')
  })

  it('passes checkAccountId as bracketed param', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccountTransaction`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTransactions({ checkAccountId: '30' })
    expect(capturedUrl).toContain('checkAccount%5Bid%5D=30')
    expect(capturedUrl).toContain('checkAccount%5BobjectName%5D=CheckAccount')
  })

  it('passes date range filters', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccountTransaction`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTransactions({ startDate: '2024-01-01', endDate: '2024-12-31' })
    expect(capturedUrl).toContain('startDate=2024-01-01')
    expect(capturedUrl).toContain('endDate=2024-12-31')
  })

  it('passes status filter', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/CheckAccountTransaction`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTransactions({ status: '100' })
    expect(capturedUrl).toContain('status=100')
  })
})

describe('getTransaction', () => {
  it('fetches transaction by ID', async () => {
    server.use(
      http.get(`${BASE}/CheckAccountTransaction/300`, () =>
        HttpResponse.json({ objects: makeTransaction() })
      )
    )
    const result = await getTransaction({ id: '300' })
    expect(result.id).toBe('300')
  })
})

describe('createTransaction', () => {
  it('creates transaction with required fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CheckAccountTransaction`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTransaction() })
      })
    )
    await createTransaction({ checkAccountId: '30', amount: 500, valueDate: '2024-06-01' })
    expect(capturedBody.checkAccount).toEqual({ id: '30', objectName: 'CheckAccount' })
    expect(capturedBody.amount).toBe(500)
    expect(capturedBody.valueDate).toBe('2024-06-01')
    expect(capturedBody.status).toBe('100')
    expect(capturedBody.payeePayerName).toBeUndefined()
    expect(capturedBody.paymtPurpose).toBeUndefined()
    expect(capturedBody.entryDate).toBeUndefined()
  })

  it('includes optional fields when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/CheckAccountTransaction`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTransaction() })
      })
    )
    await createTransaction({
      checkAccountId: '30',
      amount: -200,
      valueDate: '2024-06-01',
      payeePayerName: 'Supplier',
      paymtPurpose: 'Invoice 1',
      entryDate: '2024-06-02',
    })
    expect(capturedBody.payeePayerName).toBe('Supplier')
    expect(capturedBody.paymtPurpose).toBe('Invoice 1')
    expect(capturedBody.entryDate).toBe('2024-06-02')
  })
})

describe('updateTransaction', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CheckAccountTransaction/300`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTransaction() })
      })
    )
    await updateTransaction({ id: '300', payeePayerName: 'New Name' })
    expect(capturedBody.payeePayerName).toBe('New Name')
    expect(capturedBody.paymtPurpose).toBeUndefined()
    expect(capturedBody.status).toBeUndefined()
  })

  it('updates without payeePayerName (payeePayerName false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CheckAccountTransaction/300`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTransaction() })
      })
    )
    await updateTransaction({ id: '300', paymtPurpose: 'Payment for invoice' })
    expect(capturedBody.payeePayerName).toBeUndefined()
    expect(capturedBody.paymtPurpose).toBe('Payment for invoice')
  })

  it('updates all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/CheckAccountTransaction/300`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTransaction() })
      })
    )
    await updateTransaction({ id: '300', payeePayerName: 'N', paymtPurpose: 'P', status: '200' })
    expect(capturedBody.paymtPurpose).toBe('P')
    expect(capturedBody.status).toBe('200')
  })
})

describe('deleteTransaction', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/CheckAccountTransaction/300`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteTransaction({ id: '300' })
    expect(capturedUrl).toContain('/CheckAccountTransaction/300')
  })
})

describe('formatTransaction', () => {
  it('formats transaction without optional fields', () => {
    const tx = makeTransaction({ payeePayerName: null, paymtPurpose: null, entryDate: null })
    const output = formatTransaction(tx)
    expect(output).toContain('ID: 300')
    expect(output).toContain('Amount: 500')
    expect(output).toContain('Value Date: 2024-01-15')
    expect(output).not.toContain('Payee/Payer:')
    expect(output).not.toContain('Purpose:')
    expect(output).not.toContain('Entry Date:')
  })

  it('includes optional fields when present', () => {
    const tx = makeTransaction({
      payeePayerName: 'Alice',
      paymtPurpose: 'Rent',
      entryDate: '2024-01-16',
    })
    const output = formatTransaction(tx)
    expect(output).toContain('Payee/Payer: Alice')
    expect(output).toContain('Purpose: Rent')
    expect(output).toContain('Entry Date: 2024-01-16')
  })
})

describe('formatTransactionsList', () => {
  it('returns "No transactions found." for empty array', () => {
    expect(formatTransactionsList([])).toBe('No transactions found.')
  })

  it('shows payeePayerName when present', () => {
    const tx = makeTransaction({ payeePayerName: 'Bob' })
    const output = formatTransactionsList([tx])
    expect(output).toContain('Found 1 transaction(s)')
    expect(output).toContain('Bob')
  })

  it('shows "Unknown" when payeePayerName is null', () => {
    const tx = makeTransaction({ payeePayerName: null })
    const output = formatTransactionsList([tx])
    expect(output).toContain('Unknown')
  })
})

describe('formatTransactionResult', () => {
  it('includes action verb', () => {
    const output = formatTransactionResult(makeTransaction(), 'created')
    expect(output).toContain('Transaction created successfully')
  })
})

describe('formatTransactionDeleteResult', () => {
  it('includes transaction ID', () => {
    expect(formatTransactionDeleteResult('300')).toBe('Transaction 300 deleted successfully.')
  })
})
