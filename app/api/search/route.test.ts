import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GET } from './route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tool: {
      findMany: vi.fn(),
    },
  },
}))

const mockedPrisma = vi.mocked(prisma, { deep: true })

function searchRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/search${query}`)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedPrisma.tool.findMany.mockResolvedValue(
    [] as Awaited<ReturnType<typeof prisma.tool.findMany>>
  )
})

describe('GET /api/search', () => {
  it('V7: q fehlt vollständig → Status 200, leeres Array, kein DB-Zugriff', async () => {
    const response = await GET(searchRequest(''))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual([])
    expect(mockedPrisma.tool.findMany).not.toHaveBeenCalled()
  })

  it('V8: q mit > 100 Zeichen → Status 200, Suche mit der auf 100 Zeichen gekürzten Eingabe', async () => {
    const longQuery = 'a'.repeat(150)
    const response = await GET(searchRequest(`?q=${longQuery}`))

    expect(response.status).toBe(200)
    expect(mockedPrisma.tool.findMany).toHaveBeenCalledTimes(1)
    const where = mockedPrisma.tool.findMany.mock.calls[0][0]?.where as {
      translations: { some: { OR: { name: { contains: string } }[] } }
    }
    expect(where.translations.some.OR[0].name.contains).toBe('a'.repeat(100))
  })

  it('V9: q mehrfach übergeben (?q=aa&q=bb) → Status 200 auf Basis des ersten Werts', async () => {
    const response = await GET(searchRequest('?q=aa&q=bb'))

    expect(response.status).toBe(200)
    expect(mockedPrisma.tool.findMany).toHaveBeenCalledTimes(1)
    const where = mockedPrisma.tool.findMany.mock.calls[0][0]?.where as {
      translations: { some: { OR: { name: { contains: string } }[] } }
    }
    expect(where.translations.some.OR[0].name.contains).toBe('aa')
  })
})
