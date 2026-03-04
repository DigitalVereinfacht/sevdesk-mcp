import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/node.js'
import { makeTag, makeTagRelation } from './mocks/fixtures.js'
import {
  listTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  listTagRelations,
  addTagToObject,
  removeTagFromObject,
  formatTag,
  formatTagsList,
  formatTagResult,
  formatTagDeleteResult,
  formatTagRelation,
  formatTagRelationsList,
  formatTagRelationResult,
  formatTagRelationDeleteResult,
} from '../tools/tags.js'

const BASE = 'https://my.sevdesk.de/api/v1'

describe('listTags', () => {
  it('uses default limit=100', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Tag`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeTag()] })
      })
    )
    const result = await listTags({})
    expect(result).toHaveLength(1)
    expect(capturedUrl).toContain('limit=100')
  })

  it('filters by name', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Tag`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTags({ name: 'VIP' })
    expect(capturedUrl).toContain('name=VIP')
  })

  it('passes custom limit and offset', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/Tag`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTags({ limit: 10, offset: 5 })
    expect(capturedUrl).toContain('limit=10')
    expect(capturedUrl).toContain('offset=5')
  })
})

describe('getTag', () => {
  it('fetches tag by ID', async () => {
    server.use(
      http.get(`${BASE}/Tag/70`, () => HttpResponse.json({ objects: makeTag() }))
    )
    const result = await getTag({ id: '70' })
    expect(result.id).toBe('70')
  })
})

describe('createTag', () => {
  it('creates tag with name', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/Tag`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTag({ name: 'New Tag' }) })
      })
    )
    const result = await createTag({ name: 'New Tag' })
    expect(capturedBody.name).toBe('New Tag')
    expect(result.name).toBe('New Tag')
  })
})

describe('updateTag', () => {
  it('sends new name', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.put(`${BASE}/Tag/70`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTag({ name: 'Updated' }) })
      })
    )
    await updateTag({ id: '70', name: 'Updated' })
    expect(capturedBody.name).toBe('Updated')
  })
})

describe('deleteTag', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/Tag/70`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await deleteTag({ id: '70' })
    expect(capturedUrl).toContain('/Tag/70')
  })
})

describe('listTagRelations', () => {
  it('uses default limit=100 with no filters', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/TagRelation`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [makeTagRelation()] })
      })
    )
    await listTagRelations({})
    expect(capturedUrl).toContain('limit=100')
    expect(capturedUrl).not.toContain('tag%5B')
    expect(capturedUrl).not.toContain('object%5B')
  })

  it('passes tagId as bracketed params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/TagRelation`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTagRelations({ tagId: '70' })
    expect(capturedUrl).toContain('tag%5Bid%5D=70')
    expect(capturedUrl).toContain('tag%5BobjectName%5D=Tag')
  })

  it('passes objectName+objectId as bracketed params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/TagRelation`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTagRelations({ objectName: 'Contact', objectId: '1' })
    expect(capturedUrl).toContain('object%5Bid%5D=1')
    expect(capturedUrl).toContain('object%5BobjectName%5D=Contact')
  })

  it('omits object params when objectId is missing', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/TagRelation`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ objects: [] })
      })
    )
    await listTagRelations({ objectName: 'Contact' })
    expect(capturedUrl).not.toContain('object%5B')
  })
})

describe('addTagToObject', () => {
  it('sends correct wrapped body', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/TagRelation`, async ({ request }) => {
        capturedBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ objects: makeTagRelation() })
      })
    )
    await addTagToObject({ tagId: '70', objectName: 'Invoice', objectId: '10' })
    expect(capturedBody.tag).toEqual({ id: '70', objectName: 'Tag' })
    expect(capturedBody.object).toEqual({ id: '10', objectName: 'Invoice' })
  })
})

describe('removeTagFromObject', () => {
  it('sends DELETE to correct endpoint', async () => {
    let capturedUrl = ''
    server.use(
      http.delete(`${BASE}/TagRelation/700`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(null, { status: 200 })
      })
    )
    await removeTagFromObject({ id: '700' })
    expect(capturedUrl).toContain('/TagRelation/700')
  })
})

describe('formatTag', () => {
  it('formats tag with all fields', () => {
    const tag = makeTag({ id: '70', name: 'VIP' })
    const output = formatTag(tag)
    expect(output).toContain('ID: 70')
    expect(output).toContain('Name: VIP')
    expect(output).toContain('Created:')
    expect(output).toContain('Updated:')
  })
})

describe('formatTagsList', () => {
  it('returns "No tags found." for empty array', () => {
    expect(formatTagsList([])).toBe('No tags found.')
  })

  it('lists tags', () => {
    const output = formatTagsList([makeTag(), makeTag({ id: '71', name: 'Premium' })])
    expect(output).toContain('Found 2 tag(s)')
    expect(output).toContain('[70]')
    expect(output).toContain('Test Tag')
  })
})

describe('formatTagResult', () => {
  it('includes action verb', () => {
    const output = formatTagResult(makeTag(), 'created')
    expect(output).toContain('Tag created successfully')
    expect(output).toContain('ID: 70')
  })
})

describe('formatTagDeleteResult', () => {
  it('includes tag ID', () => {
    expect(formatTagDeleteResult('70')).toBe('Tag 70 deleted successfully.')
  })
})

describe('formatTagRelation', () => {
  it('includes relation ID, tag ID, and object info', () => {
    const relation = makeTagRelation()
    const output = formatTagRelation(relation)
    expect(output).toContain('Tag Relation ID: 700')
    expect(output).toContain('Tag ID: 70')
    expect(output).toContain('Object: Contact (ID: 1)')
  })
})

describe('formatTagRelationsList', () => {
  it('returns "No tag relations found." for empty array', () => {
    expect(formatTagRelationsList([])).toBe('No tag relations found.')
  })

  it('lists relations', () => {
    const output = formatTagRelationsList([makeTagRelation()])
    expect(output).toContain('Found 1 tag relation(s)')
    expect(output).toContain('[700]')
    expect(output).toContain('Tag 70')
    expect(output).toContain('Contact:1')
  })
})

describe('formatTagRelationResult', () => {
  it('includes action verb', () => {
    const output = formatTagRelationResult(makeTagRelation(), 'added')
    expect(output).toContain('Tag relation added successfully')
  })
})

describe('formatTagRelationDeleteResult', () => {
  it('includes relation ID', () => {
    expect(formatTagRelationDeleteResult('700')).toBe('Tag relation 700 removed successfully.')
  })
})
