import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/node.js'

// Set default API token for all tests
process.env.SEVDESK_API_TOKEN = 'test-token-123'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
