import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import {
  extractSingleObject,
  buildQueryString,
  sevdeskFetch,
  sevdeskPost,
  sevdeskPut,
  sevdeskDelete,
  sevdeskFetchPdf,
  sevdeskUploadFile,
} from '../api.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('extractSingleObject', () => {
  it('returns first item when objects is an array', () => {
    const result = extractSingleObject({ objects: [{ id: '1' }, { id: '2' }] })
    expect(result).toEqual({ id: '1' })
  })

  it('returns object directly when not an array', () => {
    const result = extractSingleObject({ objects: { id: '1' } })
    expect(result).toEqual({ id: '1' })
  })
})

describe('buildQueryString', () => {
  it('returns empty string for empty params', () => {
    expect(buildQueryString({})).toBe('')
  })

  it('returns empty string when all values are undefined', () => {
    expect(buildQueryString({ a: undefined, b: undefined })).toBe('')
  })

  it('builds query string from defined params', () => {
    const qs = buildQueryString({ limit: 100, offset: 0, name: 'test' })
    expect(qs).toBe('?limit=100&offset=0&name=test')
  })

  it('filters out undefined values', () => {
    const qs = buildQueryString({ limit: 100, offset: undefined, name: 'test' })
    expect(qs).toBe('?limit=100&name=test')
  })

  it('encodes boolean values', () => {
    const qs = buildQueryString({ download: true, withEnshrined: false })
    expect(qs).toBe('?download=true&withEnshrined=false')
  })

  it('encodes special characters in keys (e.g., brackets)', () => {
    const qs = buildQueryString({ 'contact[id]': '1', 'contact[objectName]': 'Contact' })
    expect(qs).toContain('contact%5Bid%5D=1')
    expect(qs).toContain('contact%5BobjectName%5D=Contact')
  })
})

describe('sevdeskFetch', () => {
  beforeEach(() => {
    process.env.SEVDESK_API_TOKEN = 'test-token-123'
    delete process.env.SEVDESK_API_VERSION
  })

  it('fetches and returns JSON on success', async () => {
    server.use(
      http.get(`${BASE}/Contact`, () => HttpResponse.json({ objects: [{ id: '1' }] }))
    )
    const result = await sevdeskFetch<{ objects: unknown[] }>('/Contact')
    expect(result).toEqual({ objects: [{ id: '1' }] })
  })

  it('throws on non-ok response', async () => {
    server.use(
      http.get(`${BASE}/Contact`, () =>
        new HttpResponse('Unauthorized', { status: 401 })
      )
    )
    await expect(sevdeskFetch('/Contact')).rejects.toThrow('Sevdesk API error (401)')
  })

  it('throws when SEVDESK_API_TOKEN is missing', async () => {
    delete process.env.SEVDESK_API_TOKEN
    await expect(sevdeskFetch('/Contact')).rejects.toThrow('SEVDESK_API_TOKEN')
  })

  it('includes Authorization header', async () => {
    let capturedAuth = ''
    server.use(
      http.get(`${BASE}/Contact`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization') ?? ''
        return HttpResponse.json({ objects: [] })
      })
    )
    await sevdeskFetch('/Contact')
    expect(capturedAuth).toBe('test-token-123')
  })

  it('includes X-Version header when SEVDESK_API_VERSION is set', async () => {
    process.env.SEVDESK_API_VERSION = '2.0'
    let capturedVersion = ''
    server.use(
      http.get(`${BASE}/Contact`, ({ request }) => {
        capturedVersion = request.headers.get('X-Version') ?? ''
        return HttpResponse.json({ objects: [] })
      })
    )
    await sevdeskFetch('/Contact')
    expect(capturedVersion).toBe('2.0')
  })

  it('does NOT include X-Version header when SEVDESK_API_VERSION is absent', async () => {
    let hasVersion = false
    server.use(
      http.get(`${BASE}/Contact`, ({ request }) => {
        hasVersion = request.headers.has('X-Version')
        return HttpResponse.json({ objects: [] })
      })
    )
    await sevdeskFetch('/Contact')
    expect(hasVersion).toBe(false)
  })

  it('includes error text in thrown error', async () => {
    server.use(
      http.get(`${BASE}/Contact`, () =>
        new HttpResponse('Rate limit exceeded', { status: 400 })
      )
    )
    await expect(sevdeskFetch('/Contact')).rejects.toThrow('Rate limit exceeded')
  })
})

describe('sevdeskPost', () => {
  it('sends POST request with JSON body', async () => {
    let capturedMethod = ''
    let capturedBody: unknown = null
    server.use(
      http.post(`${BASE}/Contact`, async ({ request }) => {
        capturedMethod = request.method
        capturedBody = await request.json()
        return HttpResponse.json({ objects: { id: '1', name: 'Acme' } })
      })
    )
    await sevdeskPost('/Contact', { name: 'Acme' })
    expect(capturedMethod).toBe('POST')
    expect(capturedBody).toEqual({ name: 'Acme' })
  })
})

describe('sevdeskPut', () => {
  it('sends PUT request with JSON body', async () => {
    let capturedMethod = ''
    let capturedBody: unknown = null
    server.use(
      http.put(`${BASE}/Contact/1`, async ({ request }) => {
        capturedMethod = request.method
        capturedBody = await request.json()
        return HttpResponse.json({ objects: { id: '1', name: 'Updated' } })
      })
    )
    await sevdeskPut('/Contact/1', { name: 'Updated' })
    expect(capturedMethod).toBe('PUT')
    expect(capturedBody).toEqual({ name: 'Updated' })
  })
})

describe('sevdeskDelete', () => {
  it('sends DELETE request successfully', async () => {
    let capturedMethod = ''
    server.use(
      http.delete(`${BASE}/Contact/1`, ({ request }) => {
        capturedMethod = request.method
        return new HttpResponse(null, { status: 200 })
      })
    )
    await expect(sevdeskDelete('/Contact/1')).resolves.toBeUndefined()
    expect(capturedMethod).toBe('DELETE')
  })

  it('throws on non-ok DELETE response', async () => {
    server.use(
      http.delete(`${BASE}/Contact/1`, () =>
        new HttpResponse('Not found', { status: 404 })
      )
    )
    await expect(sevdeskDelete('/Contact/1')).rejects.toThrow('Sevdesk API error (404)')
  })

  it('throws on DELETE with empty response body', async () => {
    server.use(
      http.delete(`${BASE}/Contact/1`, () =>
        new HttpResponse(null, { status: 403 })
      )
    )
    await expect(sevdeskDelete('/Contact/1')).rejects.toThrow('403')
  })
})

describe('sevdeskFetchPdf', () => {
  it('returns base64 content from objects.content', async () => {
    server.use(
      http.get(`${BASE}/Invoice/1/getPdf`, () =>
        HttpResponse.json({ objects: { content: 'base64string' } })
      )
    )
    const result = await sevdeskFetchPdf('/Invoice/1/getPdf')
    expect(result).toBe('base64string')
  })

  it('throws on non-ok PDF response', async () => {
    server.use(
      http.get(`${BASE}/Invoice/1/getPdf`, () =>
        new HttpResponse('Error', { status: 500 })
      )
    )
    // 500 is retryable so it will retry 3 times with fake timers
    vi.useFakeTimers()
    const promise = sevdeskFetchPdf('/Invoice/1/getPdf')
    // Attach handler before timers fire to avoid unhandled rejection warning
    const assertion = expect(promise).rejects.toThrow('500')
    await vi.runAllTimersAsync()
    await assertion
    vi.useRealTimers()
  })
})

describe('sevdeskUploadFile', () => {
  it('sends multipart FormData and returns file info', async () => {
    let capturedFormData: FormData | null = null
    server.use(
      http.post(`${BASE}/Voucher/Factory/uploadTempFile`, async ({ request }) => {
        capturedFormData = await request.formData()
        return HttpResponse.json({
          objects: { filename: 'receipt.pdf', pages: 1, mimeType: 'application/pdf' },
        })
      })
    )
    const result = await sevdeskUploadFile(
      '/Voucher/Factory/uploadTempFile',
      Buffer.from('PDF content').toString('base64'),
      'receipt.pdf'
    )
    expect(result.filename).toBe('receipt.pdf')
    expect(result.pages).toBe(1)
    expect((capturedFormData as unknown as FormData).get('file')).toBeTruthy()
  })

  it('throws on non-ok upload response', async () => {
    server.use(
      http.post(`${BASE}/Voucher/Factory/uploadTempFile`, () =>
        new HttpResponse('Bad request', { status: 400 })
      )
    )
    await expect(
      sevdeskUploadFile('/Voucher/Factory/uploadTempFile', 'base64data', 'test.pdf')
    ).rejects.toThrow('400')
  })
})

describe('retry logic', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('succeeds after one 429 (one retry)', async () => {
    vi.useFakeTimers()
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        if (callCount === 1) return new HttpResponse(null, { status: 429 })
        return HttpResponse.json({ objects: [] })
      })
    )
    const promise = sevdeskFetch<{ objects: unknown[] }>('/Contact')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(callCount).toBe(2)
    expect(result).toEqual({ objects: [] })
  })

  it('throws after max retries (4x 429)', async () => {
    vi.useFakeTimers()
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        return new HttpResponse(null, { status: 429 })
      })
    )
    const promise = sevdeskFetch('/Contact')
    // Attach handler before timers fire to avoid unhandled rejection warning
    const assertion = expect(promise).rejects.toThrow('429')
    await vi.runAllTimersAsync()
    await assertion
    expect(callCount).toBe(4) // attempts 0,1,2,3
  })

  it('retries on 500 server error', async () => {
    vi.useFakeTimers()
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        if (callCount === 1) return new HttpResponse(null, { status: 500 })
        return HttpResponse.json({ objects: [] })
      })
    )
    const promise = sevdeskFetch<{ objects: unknown[] }>('/Contact')
    await vi.runAllTimersAsync()
    const result = await promise
    expect(callCount).toBe(2)
    expect(result).toEqual({ objects: [] })
  })

  it('does NOT retry on non-retryable 4xx (e.g., 400)', async () => {
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        return new HttpResponse('Bad request', { status: 400 })
      })
    )
    await expect(sevdeskFetch('/Contact')).rejects.toThrow('400')
    expect(callCount).toBe(1)
  })

  it('does NOT retry on non-retryable 4xx (e.g., 404)', async () => {
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        return new HttpResponse('Not found', { status: 404 })
      })
    )
    await expect(sevdeskFetch('/Contact')).rejects.toThrow('404')
    expect(callCount).toBe(1)
  })

  it('uses Retry-After header for delay (valid integer)', async () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        if (callCount === 1) {
          return new HttpResponse(null, {
            status: 429,
            headers: { 'Retry-After': '5' },
          })
        }
        return HttpResponse.json({ objects: [] })
      })
    )
    const promise = sevdeskFetch<{ objects: unknown[] }>('/Contact')
    await vi.runAllTimersAsync()
    await promise
    const delays = setTimeoutSpy.mock.calls.map((c) => c[1])
    expect(delays).toContain(5000)
    setTimeoutSpy.mockRestore()
  })

  it('uses exponential backoff when Retry-After is NaN', async () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        if (callCount === 1) {
          return new HttpResponse(null, {
            status: 429,
            headers: { 'Retry-After': 'not-a-number' },
          })
        }
        return HttpResponse.json({ objects: [] })
      })
    )
    const promise = sevdeskFetch<{ objects: unknown[] }>('/Contact')
    await vi.runAllTimersAsync()
    await promise
    // BASE_DELAY_MS=1000 * 2^0 = 1000ms on first retry
    const delays = setTimeoutSpy.mock.calls.map((c) => c[1])
    expect(delays).toContain(1000)
    setTimeoutSpy.mockRestore()
  })

  it('uses exponential backoff without Retry-After header', async () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    let callCount = 0
    server.use(
      http.get(`${BASE}/Contact`, () => {
        callCount++
        if (callCount === 1) return new HttpResponse(null, { status: 429 })
        return HttpResponse.json({ objects: [] })
      })
    )
    const promise = sevdeskFetch<{ objects: unknown[] }>('/Contact')
    await vi.runAllTimersAsync()
    await promise
    const delays = setTimeoutSpy.mock.calls.map((c) => c[1])
    expect(delays).toContain(1000) // BASE_DELAY_MS * 2^0
    setTimeoutSpy.mockRestore()
  })
})
