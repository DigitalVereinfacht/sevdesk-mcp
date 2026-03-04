import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import {
  exportDatev,
  exportInvoiceCsv,
  exportVoucherListCsv,
  exportTransactionsCsv,
  formatDatevExportResult,
  formatCsvExportResult,
} from '../tools/exports.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('exportDatev', () => {
  it('uses default scope="EXTCD" and false defaults', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/datevCSV`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 'datev.zip', content: 'base64' } })
      })
    )
    const result = await exportDatev({ startDate: '2024-01-01', endDate: '2024-12-31' })
    expect(capturedUrl).toContain('scope=EXTCD')
    expect(capturedUrl).toContain('start_date=2024-01-01')
    expect(capturedUrl).toContain('end_date=2024-12-31')
    expect(capturedUrl).toContain('with_enshrined_documents=false')
    expect(capturedUrl).toContain('with_unpaid_documents=false')
    expect(capturedUrl).toContain('enshrine=false')
    expect(result).toContain('datev.zip')
  })

  it('uses custom scope and sets flags to true', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/datevCSV`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 'datev.zip', content: 'base64' } })
      })
    )
    await exportDatev({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      scope: 'EX',
      withEnshrined: true,
      withUnpaidDocuments: true,
      enshrine: true,
    })
    expect(capturedUrl).toContain('scope=EX')
    expect(capturedUrl).toContain('with_enshrined_documents=true')
    expect(capturedUrl).toContain('with_unpaid_documents=true')
    expect(capturedUrl).toContain('enshrine=true')
  })
})

describe('exportInvoiceCsv', () => {
  it('exports without date filters', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/invoiceCsv`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 'invoices.csv', content: 'base64' } })
      })
    )
    const result = await exportInvoiceCsv({})
    expect(capturedUrl).toContain('download=true')
    expect(capturedUrl).not.toContain('startDate')
    expect(result).toContain('invoices.csv')
  })

  it('passes date range when provided', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/invoiceCsv`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 'invoices.csv', content: 'x' } })
      })
    )
    await exportInvoiceCsv({ startDate: '2024-01-01', endDate: '2024-06-30' })
    expect(capturedUrl).toContain('startDate=2024-01-01')
    expect(capturedUrl).toContain('endDate=2024-06-30')
  })
})

describe('exportVoucherListCsv', () => {
  it('exports without date filters', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/voucherListCsv`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 'vouchers.csv', content: 'base64' } })
      })
    )
    const result = await exportVoucherListCsv({})
    expect(capturedUrl).toContain('download=true')
    expect(result).toContain('vouchers.csv')
  })

  it('passes date range when provided', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/voucherListCsv`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 'v.csv', content: 'x' } })
      })
    )
    await exportVoucherListCsv({ startDate: '2024-01-01', endDate: '2024-03-31' })
    expect(capturedUrl).toContain('startDate=2024-01-01')
    expect(capturedUrl).toContain('endDate=2024-03-31')
  })
})

describe('exportTransactionsCsv', () => {
  it('exports without checkAccountId', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/transactionsCsv`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 'transactions.csv', content: 'base64' } })
      })
    )
    const result = await exportTransactionsCsv({})
    expect(capturedUrl).toContain('download=true')
    expect(capturedUrl).not.toContain('checkAccount')
    expect(result).toContain('transactions.csv')
  })

  it('passes checkAccountId as bracketed param', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/transactionsCsv`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 't.csv', content: 'x' } })
      })
    )
    await exportTransactionsCsv({ checkAccountId: '30' })
    expect(capturedUrl).toContain('checkAccount%5Bid%5D=30')
  })

  it('passes date range', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Export/transactionsCsv`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { filename: 't.csv', content: 'x' } })
      })
    )
    await exportTransactionsCsv({ startDate: '2024-01-01', endDate: '2024-12-31' })
    expect(capturedUrl).toContain('startDate=2024-01-01')
    expect(capturedUrl).toContain('endDate=2024-12-31')
  })
})

describe('formatDatevExportResult', () => {
  it('includes short data without truncation', () => {
    const output = formatDatevExportResult('{"filename":"datev.zip"}')
    expect(output).toContain('DATEV export completed successfully')
    expect(output).toContain('datev.zip')
    expect(output).not.toContain('...')
  })

  it('truncates data longer than 500 chars with "..."', () => {
    const longData = 'x'.repeat(600)
    const output = formatDatevExportResult(longData)
    expect(output).toContain('...')
    expect(output).not.toContain('x'.repeat(501))
  })
})

describe('formatCsvExportResult', () => {
  it('includes type and short data', () => {
    const output = formatCsvExportResult('{"filename":"invoices.csv"}', 'Invoice')
    expect(output).toContain('Invoice CSV export completed successfully')
    expect(output).toContain('invoices.csv')
    expect(output).not.toContain('...')
  })

  it('truncates data longer than 500 chars', () => {
    const longData = 'y'.repeat(600)
    const output = formatCsvExportResult(longData, 'Voucher')
    expect(output).toContain('...')
  })
})
