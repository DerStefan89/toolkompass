import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { POST } from './route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    inquiry: {
      create: vi.fn(),
    },
  },
}))

const mockedPrisma = vi.mocked(prisma, { deep: true })

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/anfrage', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedPrisma.inquiry.create.mockResolvedValue(
    {} as Awaited<ReturnType<typeof prisma.inquiry.create>>
  )
})

describe('POST /api/anfrage', () => {
  it('V1: Body null → Status 400', async () => {
    const response = await POST(postRequest(null))

    expect(response.status).toBe(400)
  })

  it('V2: Body ohne email → Status 400', async () => {
    const response = await POST(
      postRequest({ name: 'Max Mustermann', description: 'Ein Tool für X' })
    )

    expect(response.status).toBe(400)
  })

  it('V3: email ohne @/. → Status 400', async () => {
    const response = await POST(
      postRequest({
        name: 'Max Mustermann',
        email: 'kein-at-zeichen',
        description: 'Ein Tool für X',
      })
    )

    expect(response.status).toBe(400)
  })

  it('V4: name als Zahl → Status 400', async () => {
    const response = await POST(
      postRequest({
        name: 12345,
        email: 'max@example.com',
        description: 'Ein Tool für X',
      })
    )

    expect(response.status).toBe(400)
  })

  it('V5: gültige Pflichtfelder ohne optionale Felder → Status 200, success:true', async () => {
    const response = await POST(
      postRequest({
        name: 'Max Mustermann',
        email: 'max@example.com',
        description: 'Ein Tool für X',
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ success: true })
  })

  it('V6: befüllter Honeypot → Status 200, success:true, kein prisma.inquiry.create', async () => {
    const response = await POST(
      postRequest({
        name: 'Max Mustermann',
        email: 'max@example.com',
        description: 'Ein Tool für X',
        _honeypot: 'ich bin ein Bot',
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ success: true })
    expect(mockedPrisma.inquiry.create).not.toHaveBeenCalled()
  })
})
