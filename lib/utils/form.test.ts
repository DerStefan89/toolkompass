import { describe, expect, it } from 'vitest'
import { parseLines, toSlug } from './form'

describe('toSlug', () => {
  it('wandelt Umlaute in ihre ASCII-Entsprechung um', () => {
    expect(toSlug('Über Uns')).toBe('ueber-uns')
  })

  it('wandelt ß in ss um', () => {
    expect(toSlug('Straße')).toBe('strasse')
  })

  it('ersetzt Sonderzeichen durch einzelne Bindestriche', () => {
    expect(toSlug('Tool & Co. (Beta)!')).toBe('tool-co-beta')
  })

  it('entfernt führende und schließende Bindestriche', () => {
    expect(toSlug('-Test-')).toBe('test')
  })
})

describe('parseLines', () => {
  it('gibt ein leeres Array zurück, wenn der Wert fehlt', () => {
    const formData = new FormData()
    expect(parseLines(formData, 'zeilen')).toEqual([])
  })

  it('gibt ein leeres Array zurück, wenn der Wert kein String ist', () => {
    const formData = new FormData()
    formData.append('zeilen', new Blob(['x']), 'datei.txt')
    expect(parseLines(formData, 'zeilen')).toEqual([])
  })

  it('entfernt Leerzeilen und trimmt jede Zeile', () => {
    const formData = new FormData()
    formData.append('zeilen', 'eins\n\n  \nzwei  \n')
    expect(parseLines(formData, 'zeilen')).toEqual(['eins', 'zwei'])
  })
})
