/**
 * Datei: components/ui/IconRenderer.tsx
 *
 * Zweck: Rendert einen lucide-react Icon anhand eines String-Namens aus der DB.
 * Konvertiert "layout-dashboard" → "LayoutDashboard" und sucht in lucide-react.
 * Fallback: Grid-Icon wenn kein Match gefunden wird.
 *
 * Wichtig: Server Component — kein 'use client' nötig, kein Client-Bundle-Impact.
 */

import * as Icons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

type Props = {
  icon:    string | null | undefined
  size?:   number
  color?:  string
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

export default function IconRenderer({ icon, size = 24, color }: Props) {
  const iconProps: LucideProps = { size, color }

  if (icon) {
    const key = toPascalCase(icon)
    const IconComponent = (Icons as Record<string, unknown>)[key]
    // lucide-react v0.3+ exports forwardRef objects, not plain functions
    if (IconComponent != null) {
      const Ic = IconComponent as React.ComponentType<LucideProps>
      return <Ic {...iconProps} />
    }
  }

  // Fallback: generisches Grid-Icon
  return <Icons.Grid {...iconProps} />
}
