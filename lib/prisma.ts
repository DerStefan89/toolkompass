/**
 * Datei: lib/prisma.ts
 *
 * Zweck: Zentraler Prisma Client Singleton für die gesamte App.
 *
 * Wichtig:
 * - Prisma 7 benötigt einen expliziten Driver Adapter (PrismaPg).
 * - In Next.js (Dev-Modus) wird das Modul bei jedem Hot-Reload neu geladen.
 *   globalThis verhindert zu viele offene DB-Verbindungen.
 * - DATABASE_URL (Pooler, Port 6543) für Query-Operationen im App-Betrieb.
 * - DIRECT_URL (Port 5432) nur für Migrationen und Seed (prisma.config.ts).
 */

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
