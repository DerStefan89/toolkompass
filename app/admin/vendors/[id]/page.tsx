/**
 * Datei: app/admin/vendors/[id]/page.tsx
 *
 * Zweck: Admin-Seite zum Bearbeiten eines bestehenden Vendors.
 * Lädt den Vendor aus der DB und übergibt die Daten als defaultValues an VendorForm.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 *
 * Wichtig:
 * - updateVendor benötigt die Vendor-ID als erstes Argument.
 *   Sie wird per .bind(null, id) vorgefüllt, bevor sie an VendorForm übergeben wird.
 */

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VendorForm from '@/components/admin/VendorForm'
import { updateVendor } from '@/app/admin/vendors/actions'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditVendorPage({ params }: Props) {
  const { id } = await params

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      _count: { select: { tools: true } },
    },
  })

  if (!vendor) notFound()

  const defaultValues = {
    name:        vendor.name,
    slug:        vendor.slug,
    website:     vendor.website     ?? '',
    description: vendor.description ?? '',
  }

  // updateVendor erwartet die Vendor-ID als erstes Argument;
  // .bind() bindet sie vor, damit VendorForm die generische Signatur erhält
  const boundUpdateVendor = updateVendor.bind(null, id)

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <a
          href="/admin/vendors"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Anbieter-Liste
        </a>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
        }}>
          {vendor.name} bearbeiten
        </h1>

        {/* Kontext: wie viele Tools diesem Vendor zugeordnet sind */}
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          marginTop: '4px',
        }}>
          {vendor._count.tools} {vendor._count.tools === 1 ? 'Tool' : 'Tools'} zugeordnet
          <span style={{ marginLeft: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
            ID: {id}
          </span>
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <VendorForm
          action={boundUpdateVendor}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  )
}
