import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GET } from './route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    affiliateLink: {
      findUnique: vi.fn(),
    },
    affiliateClick: {
      create: vi.fn(),
    },
  },
}))

const mockedPrisma = vi.mocked(prisma, { deep: true })

function trackRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/track/irgendeine-id', {
    headers: new Headers(headers),
  })
}

function callGet(linkId: string, headers: Record<string, string> = {}) {
  return GET(trackRequest(headers), { params: Promise.resolve({ linkId }) })
}

const browserHeaders = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'accept-language': 'de-DE',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/track/[linkId]', () => {
  it('V10: unbekannter linkId → Status 302, Redirect zur Startseite', async () => {
    mockedPrisma.affiliateLink.findUnique.mockResolvedValue(null)

    const response = await callGet('nicht-existierende-id', browserHeaders)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('http://localhost/')
  })

  it('V11: kein User-Agent-Header → weiterhin als Bot behandelt, Status 302', async () => {
    const response = await callGet('irgendeine-id', { 'accept-language': 'de-DE' })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('http://localhost/')
    expect(mockedPrisma.affiliateLink.findUnique).not.toHaveBeenCalled()
  })

  it('V12: leerer String als linkId → Status 400, kein findUnique-Aufruf', async () => {
    const response = await callGet('', browserHeaders)

    expect(response.status).toBe(400)
    expect(mockedPrisma.affiliateLink.findUnique).not.toHaveBeenCalled()
  })

  it('F3: NUL-Byte in linkId, findUnique wirft Error → Status 302, Redirect zur Startseite statt 500', async () => {
    mockedPrisma.affiliateLink.findUnique.mockRejectedValue(new Error('invalid byte sequence'))

    const response = await callGet('foo\u0000bar', browserHeaders)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('http://localhost/')
  })
})
