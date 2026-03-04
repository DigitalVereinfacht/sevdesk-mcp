import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeOrder, makeOrderPos } from './mocks/fixtures.js'
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderPdf,
  sendOrderEmail,
  changeOrderStatus,
  listOrderPositions,
  getOrderPosition,
  createOrderPosition,
  updateOrderPosition,
  deleteOrderPosition,
  formatOrder,
  formatOrdersList,
  formatOrderResult,
  formatOrderDeleteResult,
  formatOrderPdfResult,
  formatOrderEmailSentResult,
  formatOrderStatusChangeResult,
  formatOrderPosition,
  formatOrderPositionsList,
  formatOrderPositionResult,
  formatOrderPositionDeleteResult,
} from '../tools/orders.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listOrders', () => {
  it('uses default limit=100 and depth=0', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Order`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeOrder()] })
      })
    )
    const result = await listOrders({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
    expect(capturedUrl).toContain('depth=0')
  })

  it('passes status filter', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Order`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listOrders({ status: '200' })
    expect(capturedUrl).toContain('status=200')
  })

  it('passes orderNumber filter', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Order`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listOrders({ orderNumber: 'AN-001' })
    expect(capturedUrl).toContain('orderNumber=AN-001')
  })

  it('passes date range filters', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Order`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listOrders({ startDate: '2024-01-01', endDate: '2024-12-31' })
    expect(capturedUrl).toContain('startDate=2024-01-01')
    expect(capturedUrl).toContain('endDate=2024-12-31')
  })

  it('passes contactId as bracketed param', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Order`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listOrders({ contactId: '99' })
    expect(capturedUrl).toContain('contact%5Bid%5D=99')
    expect(capturedUrl).toContain('contact%5BobjectName%5D=Contact')
  })
})

describe('getOrder', () => {
  it('fetches order by ID', async () => {
    const order = makeOrder({ id: '40' })
    server.use(
      http.get(`${BASE}/Order/40`, () => HttpResponse.json({ objects: order }))
    )
    const result = await getOrder({ id: '40' })
    expect(result.id).toBe('40')
  })
})

describe('createOrder', () => {
  it('defaults orderDate to today when not provided', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      positions: [{ quantity: 1, price: 100, name: 'Service', taxRate: 19 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.orderDate).toBe('2024-06-15')
    vi.useRealTimers()
  })

  it('uses provided orderDate', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      orderDate: '2024-03-01',
      positions: [{ quantity: 1, price: 50, name: 'Item', taxRate: 0 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.orderDate).toBe('2024-03-01')
  })

  it('forces taxType="default" when taxRule is provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      taxRule: 1,
      taxType: 'eu',
      positions: [{ quantity: 1, price: 100, name: 'Item', taxRate: 19 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.taxType).toBe('default')
    expect(order.taxRule).toEqual({ id: 1, objectName: 'TaxRule' })
  })

  it('uses provided taxType when no taxRule', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      taxType: 'eu',
      positions: [{ quantity: 1, price: 100, name: 'Item', taxRate: 0 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.taxType).toBe('eu')
    expect(order.taxRule).toBeUndefined()
  })

  it('defaults orderType to "AN"', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      positions: [{ quantity: 1, price: 10, name: 'Item', taxRate: 0 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.orderType).toBe('AN')
  })

  it('sets custom orderType', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder({ orderType: 'LI' }) } })
      })
    )
    await createOrder({
      contactId: '1',
      orderType: 'LI',
      positions: [{ quantity: 1, price: 10, name: 'Item', taxRate: 0 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.orderType).toBe('LI')
  })

  it('sets showNet=false when explicitly false', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      showNet: false,
      positions: [{ quantity: 1, price: 10, name: 'Item', taxRate: 0 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.showNet).toBe(false)
  })

  it('includes optional header, headText, footText, deliveryDate', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      header: 'Order Header',
      headText: 'Head',
      footText: 'Foot',
      deliveryDate: '2024-02-01',
      positions: [{ quantity: 1, price: 10, name: 'Item', taxRate: 0 }],
    })
    const order = capturedBody.order as Record<string, unknown>
    expect(order.header).toBe('Order Header')
    expect(order.headText).toBe('Head')
    expect(order.footText).toBe('Foot')
    expect(order.deliveryDate).toBe('2024-02-01')
  })

  it('maps positions with optional text/discount/partId', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: { order: makeOrder() } })
      })
    )
    await createOrder({
      contactId: '1',
      positions: [
        {
          quantity: 2,
          price: 50,
          name: 'Product',
          taxRate: 19,
          unity: 9,
          text: 'Details',
          discount: 10,
          partId: 'P-1',
        },
      ],
    })
    const positions = capturedBody.orderPosSave as Record<string, unknown>[]
    expect(positions[0].text).toBe('Details')
    expect(positions[0].discount).toBe(10)
    expect(positions[0].part).toEqual({ id: 'P-1', objectName: 'Part' })
    expect(positions[0].unity).toEqual({ id: 9, objectName: 'Unity' })
  })

  it('returns the order from response', async () => {
    server.use(
      http.post(`${BASE}/Order/Factory/saveOrder`, async () =>
        HttpResponse.json({ objects: { order: makeOrder({ id: '99' }) } })
      )
    )
    const result = await createOrder({
      contactId: '1',
      positions: [{ quantity: 1, price: 10, name: 'Item', taxRate: 0 }],
    })
    expect(result.id).toBe('99')
  })
})

describe('createOrder userId caching', () => {
  it('calls /SevUser only once for multiple creates', async () => {
    vi.resetModules()
    let sevUserCalls = 0
    server.use(
      http.get(`${BASE}/SevUser`, () => {
        sevUserCalls++
        return HttpResponse.json({ objects: [{ id: '42' }] })
      })
    )

    const { createOrder: freshCreate } = await import('../tools/orders.js')

    await freshCreate({
      contactId: '1',
      positions: [{ quantity: 1, price: 10, name: 'Item', taxRate: 0 }],
    })
    await freshCreate({
      contactId: '2',
      positions: [{ quantity: 1, price: 10, name: 'Item', taxRate: 0 }],
    })

    expect(sevUserCalls).toBe(1)
  })
})

describe('updateOrder', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Order/40`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrder() })
      })
    )
    await updateOrder({ id: '40', header: 'New Header' })
    expect(capturedBody.header).toBe('New Header')
    expect(capturedBody.headText).toBeUndefined()
  })

  it('updates without header (header false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Order/40`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrder() })
      })
    )
    await updateOrder({ id: '40', headText: 'Only head text' })
    expect(capturedBody.header).toBeUndefined()
    expect(capturedBody.headText).toBe('Only head text')
  })

  it('sends all optional fields when provided', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Order/40`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrder() })
      })
    )
    await updateOrder({
      id: '40',
      header: 'H',
      headText: 'HT',
      footText: 'FT',
      deliveryDate: '2024-03-01',
      customerInternalNote: 'Note',
    })
    expect(capturedBody.headText).toBe('HT')
    expect(capturedBody.footText).toBe('FT')
    expect(capturedBody.deliveryDate).toBe('2024-03-01')
    expect(capturedBody.customerInternalNote).toBe('Note')
  })
})

describe('deleteOrder', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/Order/40`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteOrder({ id: '40' })
    expect(capturedUrl).toContain('/Order/40')
  })
})

describe('getOrderPdf', () => {
  it('returns base64 content', async () => {
    server.use(
      http.get(`${BASE}/Order/40/getPdf`, () =>
        HttpResponse.json({ objects: { content: 'base64pdf' } })
      )
    )
    const result = await getOrderPdf({ id: '40' })
    expect(result).toBe('base64pdf')
  })

  it('includes download=true param when requested', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Order/40/getPdf`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: { content: 'pdf' } })
      })
    )
    await getOrderPdf({ id: '40', download: true })
    expect(capturedUrl).toContain('download=true')
  })
})

describe('sendOrderEmail', () => {
  it('sends email without copy by default', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/40/sendViaEmail`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: {} })
      })
    )
    await sendOrderEmail({ id: '40', email: 'a@b.com', subject: 'Sub', text: 'Body' })
    expect(capturedBody.toEmail).toBe('a@b.com')
    expect(capturedBody.copy).toBe(false)
  })

  it('sends email with copy=true', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Order/40/sendViaEmail`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: {} })
      })
    )
    await sendOrderEmail({ id: '40', email: 'a@b.com', subject: 'Sub', text: 'Body', copy: true })
    expect(capturedBody.copy).toBe(true)
  })
})

describe('changeOrderStatus', () => {
  it('sends value in body and returns order', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Order/40/changeStatus`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrder({ status: '200' }) })
      })
    )
    const result = await changeOrderStatus({ id: '40', status: 200 })
    expect(capturedBody.value).toBe(200)
    expect(result.status).toBe('200')
  })
})

describe('listOrderPositions', () => {
  it('passes orderId as bracketed param', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/OrderPos`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeOrderPos()] })
      })
    )
    await listOrderPositions({ orderId: '40' })
    expect(capturedUrl).toContain('order%5Bid%5D=40')
    expect(capturedUrl).toContain('order%5BobjectName%5D=Order')
  })
})

describe('getOrderPosition', () => {
  it('fetches position by ID', async () => {
    server.use(
      http.get(`${BASE}/OrderPos/400`, () => HttpResponse.json({ objects: makeOrderPos() }))
    )
    const result = await getOrderPosition({ id: '400' })
    expect(result.id).toBe('400')
  })
})

describe('createOrderPosition', () => {
  it('creates position with required fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/OrderPos`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrderPos() })
      })
    )
    await createOrderPosition({ orderId: '40', quantity: 1, price: 100, name: 'Item', taxRate: 19 })
    expect(capturedBody.order).toEqual({ id: '40', objectName: 'Order' })
    expect(capturedBody.unity).toEqual({ id: 1, objectName: 'Unity' })
    expect(capturedBody.text).toBeUndefined()
    expect(capturedBody.discount).toBeUndefined()
    expect(capturedBody.part).toBeUndefined()
  })

  it('includes optional text, discount, partId', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/OrderPos`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrderPos() })
      })
    )
    await createOrderPosition({
      orderId: '40',
      quantity: 3,
      price: 50,
      name: 'Product',
      taxRate: 7,
      unity: 9,
      text: 'Details',
      discount: 5,
      partId: 'P-2',
    })
    expect(capturedBody.text).toBe('Details')
    expect(capturedBody.discount).toBe(5)
    expect(capturedBody.part).toEqual({ id: 'P-2', objectName: 'Part' })
    expect((capturedBody.unity as Record<string, unknown>).id).toBe(9)
  })
})

describe('updateOrderPosition', () => {
  it('sends only provided fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/OrderPos/400`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrderPos() })
      })
    )
    await updateOrderPosition({ id: '400', quantity: 5 })
    expect(capturedBody.quantity).toBe(5)
    expect(capturedBody.price).toBeUndefined()
  })

  it('updates without quantity (quantity false branch)', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/OrderPos/400`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrderPos() })
      })
    )
    await updateOrderPosition({ id: '400', price: 50 })
    expect(capturedBody.quantity).toBeUndefined()
    expect(capturedBody.price).toBe(50)
  })

  it('updates all fields', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/OrderPos/400`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeOrderPos() })
      })
    )
    await updateOrderPosition({ id: '400', quantity: 2, price: 75, name: 'Updated', taxRate: 7, text: 'T', discount: 3 })
    expect(capturedBody.price).toBe(75)
    expect(capturedBody.text).toBe('T')
    expect(capturedBody.discount).toBe(3)
  })
})

describe('deleteOrderPosition', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/OrderPos/400`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteOrderPosition({ id: '400' })
    expect(capturedUrl).toContain('/OrderPos/400')
  })
})

describe('formatOrder', () => {
  it('formats order with required fields', () => {
    const order = makeOrder({ status: '100' })
    const output = formatOrder(order)
    expect(output).toContain('ID: 40')
    expect(output).toContain('Order Number: AN-10001')
    expect(output).toContain('Status: Created')
    expect(output).toContain('Order Type: AN')
    expect(output).toContain('Contact ID: 1')
  })

  it('shows all status labels', () => {
    expect(formatOrder(makeOrder({ status: '200' }))).toContain('Status: Sent')
    expect(formatOrder(makeOrder({ status: '300' }))).toContain('Status: Accepted')
    expect(formatOrder(makeOrder({ status: '500' }))).toContain('Status: Rejected')
    expect(formatOrder(makeOrder({ status: '750' }))).toContain('Status: Partially calculated')
    expect(formatOrder(makeOrder({ status: '1000' }))).toContain('Status: Calculated')
    expect(formatOrder(makeOrder({ status: '999' }))).toContain('Status: Unknown (999)')
  })

  it('includes header when present', () => {
    const output = formatOrder(makeOrder({ header: 'My Header' }))
    expect(output).toContain('Header: My Header')
  })

  it('omits header when null', () => {
    const output = formatOrder(makeOrder({ header: null }))
    expect(output).not.toContain('Header:')
  })

  it('includes deliveryDate when present', () => {
    const output = formatOrder(makeOrder({ deliveryDate: '2024-03-01' }))
    expect(output).toContain('Delivery Date: 2024-03-01')
  })

  it('omits deliveryDate when null', () => {
    const output = formatOrder(makeOrder({ deliveryDate: null }))
    expect(output).not.toContain('Delivery Date:')
  })

  it('omits contact section when null', () => {
    const output = formatOrder(makeOrder({ contact: null }))
    expect(output).not.toContain('Contact ID:')
  })
})

describe('formatOrdersList', () => {
  it('returns "No orders found." for empty array', () => {
    expect(formatOrdersList([])).toBe('No orders found.')
  })

  it('lists orders with status label', () => {
    const orders = [makeOrder({ status: '200' }), makeOrder({ id: '41', status: '300' })]
    const output = formatOrdersList(orders)
    expect(output).toContain('Found 2 order(s)')
    expect(output).toContain('Sent')
    expect(output).toContain('Accepted')
  })
})

describe('formatOrderResult', () => {
  it('includes action verb', () => {
    const output = formatOrderResult(makeOrder(), 'created')
    expect(output).toContain('Order created successfully')
    expect(output).toContain('ID: 40')
  })
})

describe('formatOrderDeleteResult', () => {
  it('includes order ID', () => {
    expect(formatOrderDeleteResult('40')).toBe('Order 40 deleted successfully.')
  })
})

describe('formatOrderPdfResult', () => {
  it('includes order ID and content length', () => {
    const output = formatOrderPdfResult('abc', '40')
    expect(output).toContain('Order 40 PDF retrieved successfully')
    expect(output).toContain('3 characters')
  })
})

describe('formatOrderEmailSentResult', () => {
  it('includes order ID and email', () => {
    const output = formatOrderEmailSentResult('40', 'a@b.com')
    expect(output).toContain('Order 40')
    expect(output).toContain('a@b.com')
  })
})

describe('formatOrderStatusChangeResult', () => {
  it('includes order number and status label', () => {
    const output = formatOrderStatusChangeResult(makeOrder({ status: '200' }))
    expect(output).toContain('AN-10001')
    expect(output).toContain('Sent')
  })
})

describe('formatOrderPosition', () => {
  it('formats position without optional text/discount', () => {
    const pos = makeOrderPos({ text: null, discount: null })
    const output = formatOrderPosition(pos)
    expect(output).toContain('ID: 400')
    expect(output).toContain('Name: Test Service')
    expect(output).not.toContain('Text:')
    expect(output).not.toContain('Discount:')
  })

  it('includes text and discount when present', () => {
    const pos = makeOrderPos({ text: 'Details', discount: 5 })
    const output = formatOrderPosition(pos)
    expect(output).toContain('Text: Details')
    expect(output).toContain('Discount: 5%')
  })
})

describe('formatOrderPositionsList', () => {
  it('returns "No order positions found." for empty array', () => {
    expect(formatOrderPositionsList([])).toBe('No order positions found.')
  })

  it('lists positions', () => {
    const output = formatOrderPositionsList([makeOrderPos()])
    expect(output).toContain('Found 1 position(s)')
    expect(output).toContain('[400]')
    expect(output).toContain('Test Service')
  })
})

describe('formatOrderPositionResult', () => {
  it('includes action verb', () => {
    const output = formatOrderPositionResult(makeOrderPos(), 'created')
    expect(output).toContain('Order position created successfully')
  })
})

describe('formatOrderPositionDeleteResult', () => {
  it('includes position ID', () => {
    expect(formatOrderPositionDeleteResult('400')).toBe('Order position 400 deleted successfully.')
  })
})
